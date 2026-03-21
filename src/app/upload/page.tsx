"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/upload/file-uploader";
import { ManualForm } from "@/components/upload/manual-form";
import { TextUploader } from "@/components/upload/text-uploader";
import { useTranslation } from "@/context/translation-context";

export default function UploadPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto w-full max-w-6xl py-2 sm:py-4 space-y-6 sm:space-y-8 stagger-in">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t("Upload Performance Data")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
          {t("Upload files or enter records manually to add performance data.")}
        </p>
      </div>

      <Tabs defaultValue="file-upload" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-3 sm:gap-1 sm:bg-muted sm:p-1 lg:max-w-[760px]">
          <TabsTrigger value="file-upload">{t("File Upload")}</TabsTrigger>
          <TabsTrigger value="text-input">{t("Text Input (AI)")}</TabsTrigger>
          <TabsTrigger value="manual-entry">{t("Manual Entry")}</TabsTrigger>
        </TabsList>
        <TabsContent value="file-upload" className="mt-4 sm:mt-6">
          <FileUploader />
        </TabsContent>
        <TabsContent value="text-input" className="mt-4 sm:mt-6">
          <TextUploader />
        </TabsContent>
        <TabsContent value="manual-entry" className="mt-4 sm:mt-6">
          <ManualForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
