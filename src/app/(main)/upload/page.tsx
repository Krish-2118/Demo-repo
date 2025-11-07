import { DataPreview } from "@/components/upload/data-preview";
import { FileUploader } from "@/components/upload/file-uploader";

export default function UploadPage() {
    return (
        <div className="container mx-auto py-4 space-y-8">
             <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Upload Performance Data</h1>
                <p className="text-muted-foreground">
                    Upload CSV or Excel files with district-wise performance reports.
                </p>
            </div>
            <FileUploader />
            <DataPreview />
        </div>
    );
}
