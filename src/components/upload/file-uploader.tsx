'use client';
import { UploadCloud } from 'lucide-react';
import { useCallback, useState, useTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { uploadPerformanceData, parsePdf } from '@/app/actions';
import { DataPreview } from './data-preview';

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isProcessing, startProcessing] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const { toast } = useToast();

  const processFile = (fileToProcess: File) => {
    startProcessing(() => {
        toast({
            title: 'Processing File',
            description: `Parsing ${fileToProcess.name}...`,
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
                        title: 'Processing Complete',
                        description: 'Please review the data preview below.',
                    });
                } catch (error) {
                    handleError(error, 'Error processing spreadsheet.');
                }
            };
            reader.readAsBinaryString(fileToProcess);
        } else if (fileToProcess.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const dataUrl = event.target?.result as string;
                    if (!dataUrl) throw new Error("Could not read PDF file.");

                    const result = await parsePdf(dataUrl);
                    if (result.success && result.data) {
                        setParsedData(result.data);
                        toast({
                            title: 'PDF Processing Complete',
                            description: 'AI has extracted the data. Please review the preview below.',
                        });
                    } else {
                        throw new Error(result.message || 'Failed to extract data from PDF.');
                    }
                } catch (error) {
                    handleError(error, 'Error processing PDF.');
                }
            };
            reader.readAsDataURL(fileToProcess);
        } else {
            toast({
                title: 'Unsupported File Type',
                description: 'Please upload a CSV, XLSX, or PDF file.',
                variant: 'destructive'
            });
        }
    });
  }

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        toast({
          title: 'File Upload Error',
          description: 'Please upload only one file at a time.',
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
    [toast]
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
      description: (error as Error).message || 'An unexpected error occurred.',
      variant: 'destructive',
    });
  };

  const handleSave = () => {
    if (parsedData.length === 0) {
      toast({
        title: 'No Data to Save',
        description: 'Please process a file before saving.',
        variant: 'destructive',
      });
      return;
    }
    
    startSaving(async () => {
        toast({
            title: 'Saving Data',
            description: 'Submitting records to the database...',
        });
        try {
            const result = await uploadPerformanceData(parsedData);
            if (result.success) {
                toast({
                    title: 'Save Successful',
                    description: result.message,
                });
                setFile(null); // Clear file and data after successful save
                setParsedData([]);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            handleError(error, 'Save Failed');
        }
    });
  };

  const loading = isProcessing || isSaving;
  const loadingText = isProcessing ? 'Processing...' : 'Saving...';

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
            Drop the file here...
          </p>
        ) : (
          <>
            <p className="mt-4 text-lg font-semibold text-foreground">
              {loading ? loadingText : 'Drag & drop your file here, or click to select'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              (CSV, XLS, XLSX or PDF files)
            </p>
          </>
        )}
      </div>
      {file && !isProcessing && (
        <div className="text-center text-sm text-muted-foreground">
          Selected file: <strong>{file.name}</strong>
        </div>
      )}
      
      <DataPreview data={parsedData} />

      {parsedData.length > 0 && (
          <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto mx-auto">
            {isSaving ? 'Saving Records...' : 'Save Records'}
          </Button>
      )}
    </div>
  );
}