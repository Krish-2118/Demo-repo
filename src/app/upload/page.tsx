'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '@/components/upload/file-uploader';
import { ManualForm } from '@/components/upload/manual-form';
import { useTranslation } from '@/context/translation-context';

export default function UploadPage() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto py-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('Upload Performance Data')}
        </h1>
        <p className="text-muted-foreground">
          {t('Upload files or enter records manually to add performance data.')}
        </p>
      </div>

      <Tabs defaultValue="file-upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="file-upload">{t('File Upload')}</TabsTrigger>
          <TabsTrigger value="manual-entry">{t('Manual Entry')}</TabsTrigger>
        </TabsList>
        <TabsContent value="file-upload">
          <FileUploader />
        </TabsContent>
        <TabsContent value="manual-entry">
            <ManualForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
