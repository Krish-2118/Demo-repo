'use client';
import { UploadCloud } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
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

  const handleUpload = () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }
    // Placeholder for actual upload logic
    toast({
      title: 'Upload Started',
      description: `Uploading ${file.name}... (This is a placeholder)`,
    });
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
      <Button onClick={handleUpload} disabled={!file} className="w-full md:w-auto mx-auto">
        Parse and Save Records
      </Button>
    </div>
  );
}
