'use client';
import { Wand2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { DataPreview } from './data-preview';
import { useFirestore } from '@/firebase/client';
import { collection, writeBatch, doc, Timestamp, Firestore } from 'firebase/firestore';
import { districts } from '@/lib/data';
import { useTranslation } from '@/context/translation-context';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '../ui/card';
import { extractAndStructureData } from '@/ai/flows/extract-and-structure-data';


async function uploadPerformanceData(firestore: Firestore, data: any[]) {
    if (!firestore) {
        throw new Error('Firestore is not initialized.');
    }
    const recordsCollection = collection(firestore, 'records');
    const districtMap = new Map(districts.map(d => [d.name.toLowerCase(), d.id]));
    const batch = writeBatch(firestore);
    let recordsAdded = 0;

    for (const row of data) {
        const districtName = (row.District || row.districtName)?.toString().trim().toLowerCase();
        const districtId = row.districtId || districtMap.get(districtName);

        if (!districtId) {
            console.warn(`District not found or invalid, skipping row:`, row);
            continue;
        }

        const dateValue = row.Date || row.date;
        let recordDate: Date;

        if (dateValue instanceof Date) {
            recordDate = dateValue;
        } else if (dateValue && dateValue.toDate instanceof Function) { // Check for Firestore Timestamp
            recordDate = dateValue.toDate();
        } else if (typeof dateValue === 'number') { // Handle Excel date serial numbers
            recordDate = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
        } else if (typeof dateValue === 'string') {
            recordDate = new Date(dateValue);
        } else {
            console.warn(`Invalid date format, skipping row:`, row);
            continue;
        }
        
        if (isNaN(recordDate.getTime())) {
            console.warn(`Invalid date value, skipping row:`, row);
            continue;
        }

        const category = row.Category || row.category;
        const casesRegistered = Number(row['Cases Registered'] || row.casesRegistered);
        const casesSolved = Number(row['Cases Solved'] || row.casesSolved);

        if (!category || isNaN(casesRegistered) || isNaN(casesSolved)) {
            console.warn('Invalid category or values, skipping row:', row);
            continue;
        }

        if (casesSolved > casesRegistered) {
            console.warn('Cases solved cannot be greater than cases registered, skipping row:', row);
            continue;
        }

        const record = {
            districtId: districtId,
            category: category,
            casesRegistered: casesRegistered,
            casesSolved: casesSolved,
            date: Timestamp.fromDate(recordDate),
        };

        const docRef = doc(recordsCollection);
        batch.set(docRef, record);
        recordsAdded++;
    }

    if (recordsAdded > 0) {
      await batch.commit();
    }
    
    return recordsAdded;
}


export function TextUploader() {
  const [textInput, setTextInput] = useState<string>('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isProcessing, startProcessing] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const handleProcessText = () => {
    if (!textInput.trim()) {
      toast({
        title: t('No text provided'),
        description: t('Please enter some text to process.'),
        variant: 'destructive',
      });
      return;
    }

    startProcessing(async () => {
      toast({
        title: t('Processing Text with AI'),
        description: t('This may take a moment...'),
      });

      try {
        const result = await extractAndStructureData({ textInput });
        
        if (result && result.data && result.data.length > 0) {
          setParsedData(result.data);
          toast({
            title: t('AI Processing Complete'),
            description: t('Please review the extracted data preview below.'),
          });
        } else {
          throw new Error(t("AI could not find any structured data in the text provided."));
        }
      } catch (error) {
        handleError(error, t('Error processing text.'));
      }
    });
  };

  const handleError = (error: any, title: string) => {
    console.error(title, error);
    toast({
      title: title,
      description: (error as Error).message || t('An unexpected error occurred.'),
      variant: 'destructive',
    });
  };

  const handleSave = () => {
    if (parsedData.length === 0) {
      toast({
        title: t('No Data to Save'),
        description: t('Please process some text before saving.'),
        variant: 'destructive',
      });
      return;
    }
    
    startSaving(async () => {
        toast({
            title: t('Saving Data'),
            description: t('Submitting records to the database...'),
        });
        try {
            if (!firestore) throw new Error("Firestore not available");
            const recordsAdded = await uploadPerformanceData(firestore, parsedData);
            
            if (recordsAdded > 0) {
                toast({
                    title: t('Save Successful'),
                    description: t('{count} records uploaded successfully.', { count: recordsAdded }),
                });
                setTextInput('');
                setParsedData([]);
            } else {
                throw new Error(t('Upload failed. No valid records were found in the text. Please check the content.'));
            }
        } catch (error) {
            handleError(error, t('Save Failed'));
        }
    });
  };

  const loading = isProcessing || isSaving;

  return (
    <div className="grid gap-6 pt-6">
      <Card>
        <CardContent className='pt-6'>
            <div className="grid w-full gap-4">
                <Textarea 
                    placeholder={t("Paste any unstructured text here. For example: 'On 2023-10-26, Ganjam district had 5 narcotics seizures, with 3 solved. Cuttack had 12 NBW executions registered and 10 solved.'")} 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={8}
                    disabled={loading}
                />
                <Button onClick={handleProcessText} disabled={loading} className='w-full md:w-auto'>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isProcessing ? t('Processing with AI...') : t('Process with AI')}
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <DataPreview data={parsedData} />

      {parsedData.length > 0 && (
          <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto mx-auto">
            {isSaving ? t('Saving Records...') : t('Save Records')}
          </Button>
      )}
    </div>
  );
}
