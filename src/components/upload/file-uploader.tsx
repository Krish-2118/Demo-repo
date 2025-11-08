'use client';
import { UploadCloud } from 'lucide-react';
import { useCallback, useState, useTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { DataPreview } from './data-preview';
import { useFirestore } from '@/firebase/client';
import { collection, writeBatch, doc, Timestamp, Firestore } from 'firebase/firestore';
import { districts } from '@/lib/data';
import { extractDataFromPdf } from '@/ai/flows/extract-data-from-pdf';
import { useTranslation } from '@/context/translation-context';

async function uploadPerformanceData(firestore: Firestore, data: any[]) {
    if (!firestore) {
        throw new Error('Firestore is not initialized.');
    }
    const recordsCollection = collection(firestore, 'records');
    const districtMap = new Map(districts.map(d => [d.name.toLowerCase(), d.id]));
    const batch = writeBatch(firestore);
    let recordsAdded = 0;

    for (const row of data) {
        // Handle both direct properties (from manual entry) and capitalized properties (from file parsing)
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
        const value = Number(row.Value || row.value);

        if (!category || isNaN(value)) {
            console.warn('Invalid category or value, skipping row:', row);
            continue;
        }

        const record = {
            districtId: districtId,
            category: category,
            value: value,
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


export function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isProcessing, startProcessing] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const processFile = (fileToProcess: File) => {
    startProcessing(() => {
        toast({
            title: t('Processing File'),
            description: t('Parsing {fileName}...', { fileName: fileToProcess.name }),
        });

        if (fileToProcess.type.includes('spreadsheet') || fileToProcess.type.includes('csv') || fileToProcess.type.includes('excel')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const binaryStr = event.target?.result;
                    if (!binaryStr) throw new Error("File content is empty");

                    const workbook = XLSX.read(binaryStr, { type: 'binary', cellDates: true });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        raw: false,
                        dateNF: 'yyyy-mm-dd'
                    });
                    setParsedData(jsonData);
                    toast({
                        title: t('Processing Complete'),
                        description: t('Please review the data preview below.'),
                    });
                } catch (error) {
                    handleError(error, t('Error processing spreadsheet.'));
                }
            };
            reader.readAsBinaryString(fileToProcess);
        } else if (fileToProcess.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const dataUrl = event.target?.result as string;
                    if (!dataUrl) throw new Error("Could not read PDF file.");
                    
                    toast({
                        title: t('Extracting Data from PDF'),
                        description: t('This may take a moment...'),
                    });

                    const result = await extractDataFromPdf({ pdfDataUri: dataUrl });
                    
                    if (result && result.data) {
                        setParsedData(result.data);
                        toast({
                            title: t('PDF Processing Complete'),
                            description: t('Please review the extracted data preview below.'),
                        });
                    } else {
                         throw new Error("AI could not extract data from the PDF.");
                    }

                } catch (error) {
                    handleError(error, t('Error processing PDF.'));
                }
            };
            reader.readAsDataURL(fileToProcess);
        } else {
            toast({
                title: t('Unsupported File Type'),
                description: t('Please upload a CSV, XLSX, or PDF file.'),
                variant: 'destructive'
            });
        }
    });
  }

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        toast({
          title: t('File Upload Error'),
          description: t('Please upload only one file at a time.'),
          variant: 'destructive',
        });
        return;
      }
      const newFile = acceptedFiles[0];
      setFile(newFile);
      setParsedData([]); // Reset preview
      if(newFile) {
        processFile(newFile);
      }
    },
    [toast, t, processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

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
        description: t('Please process a file before saving.'),
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
                setFile(null); // Clear file and data after successful save
                setParsedData([]);
            } else {
                throw new Error(t('Upload failed. No valid records with recognizable districts and dates were found in the file. Please check the file content and format.'));
            }
        } catch (error) {
            handleError(error, t('Save Failed'));
        }
    });
  };

  const loading = isProcessing || isSaving;
  const loadingText = isProcessing ? t('Processing...') : t('Saving...');

  return (
    <div className="grid gap-6 pt-6">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50'
        } ${loading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} disabled={loading}/>
        <UploadCloud className="w-12 h-12 text-muted-foreground" />
        {isDragActive ? (
          <p className="mt-4 text-lg font-semibold text-primary">
            {t('Drop the file here...')}
          </p>
        ) : (
          <>
            <p className="mt-4 text-lg font-semibold text-foreground">
              {loading ? loadingText : t('Drag & drop your file here, or click to select')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('(CSV, XLS, XLSX or PDF files)')}
            </p>
          </>
        )}
      </div>
      {file && !isProcessing && (
        <div className="text-center text-sm text-muted-foreground">
          {t('Selected file')}: <strong>{file.name}</strong>
        </div>
      )}
      
      <DataPreview data={parsedData} />

      {parsedData.length > 0 && (
          <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto mx-auto">
            {isSaving ? t('Saving Records...') : t('Save Records')}
          </Button>
      )}
    </div>
  );
}
