'use client';
import { UploadCloud } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { uploadPerformanceData } from '@/app/actions';

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        toast({
          title: 'File Upload Error',
          description: 'Please upload only one CSV or Excel file at a time.',
          variant: 'destructive',
        });
        return;
      }
      setFile(acceptedFiles[0]);
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessing(true);
    toast({
      title: 'Upload Started',
      description: `Processing ${file.name}...`,
    });

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const binaryStr = event.target?.result;
        if (!binaryStr) {
          throw new Error("File content is empty");
        }
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const result = await uploadPerformanceData(jsonData);

        if (result.success) {
          toast({
            title: 'Upload Successful',
            description: result.message,
          });
          setFile(null); // Clear file after successful upload
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error("Error processing file:", error);
        toast({
          title: 'Upload Failed',
          description: (error as Error).message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="grid gap-6">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-12 h-12 text-muted-foreground" />
        {isDragActive ? (
          <p className="mt-4 text-lg font-semibold text-primary">
            Drop the file here...
          </p>
        ) : (
          <>
            <p className="mt-4 text-lg font-semibold text-foreground">
              Drag & drop your file here, or click to select a file
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              (CSV, XLS, or XLSX files only)
            </p>
          </>
        )}
      </div>
      {file && (
        <div className="text-center text-sm text-muted-foreground">
          Selected file: <strong>{file.name}</strong>
        </div>
      )}
      <Button onClick={handleUpload} disabled={!file || isProcessing} className="w-full md:w-auto mx-auto">
        {isProcessing ? 'Processing...' : 'Parse and Save Records'}
      </Button>
    </div>
  );
}
