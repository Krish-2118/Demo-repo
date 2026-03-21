"use client";
import { UploadCloud } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import ExcelJS from "exceljs";
import Papa from "papaparse";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { DataPreview } from "./data-preview";
import { useFirestore } from "@/firebase/client";
import {
  collection,
  writeBatch,
  doc,
  Timestamp,
  Firestore,
} from "firebase/firestore";
import { districts } from "@/lib/data";
import { extractDataFromPdf } from "@/ai/flows/extract-data-from-pdf";
import { useTranslation } from "@/context/translation-context";

async function uploadPerformanceData(firestore: Firestore, data: any[]) {
  if (!firestore) {
    throw new Error("Firestore is not initialized.");
  }
  const recordsCollection = collection(firestore, "records");
  const districtMap = new Map(
    districts.map((d) => [d.name.toLowerCase(), d.id]),
  );
  const batch = writeBatch(firestore);
  let recordsAdded = 0;

  for (const row of data) {
    const districtName = (row.District || row.districtName)
      ?.toString()
      .trim()
      .toLowerCase();
    const districtId = row.districtId || districtMap.get(districtName);

    if (!districtId) {
      console.warn(`District not found or invalid, skipping row:`, row);
      continue;
    }

    const dateValue = row.Date || row.date;
    let recordDate: Date;

    if (dateValue instanceof Date) {
      recordDate = dateValue;
    } else if (dateValue && dateValue.toDate instanceof Function) {
      // Check for Firestore Timestamp
      recordDate = dateValue.toDate();
    } else if (typeof dateValue === "number") {
      // Handle Excel date serial numbers
      recordDate = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
    } else if (typeof dateValue === "string") {
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
    const casesRegistered = Number(
      row["Cases Registered"] || row.casesRegistered,
    );
    const casesSolved = Number(row["Cases Solved"] || row.casesSolved);

    if (!category || isNaN(casesRegistered) || isNaN(casesSolved)) {
      console.warn("Invalid category or values, skipping row:", row);
      continue;
    }

    if (casesSolved > casesRegistered) {
      console.warn(
        "Cases solved cannot be greater than cases registered, skipping row:",
        row,
      );
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

function normalizeExcelCellValue(
  cellValue: ExcelJS.CellValue | undefined,
): unknown {
  if (cellValue === null || cellValue === undefined) {
    return undefined;
  }

  if (typeof cellValue === "object") {
    if ("result" in cellValue) {
      return (cellValue as { result?: unknown }).result;
    }
    if ("text" in cellValue) {
      return (cellValue as { text?: string }).text;
    }
    if ("richText" in cellValue) {
      const richText = (cellValue as { richText?: Array<{ text?: string }> })
        .richText;
      return richText?.map((part) => part.text || "").join("") || undefined;
    }
    if ("hyperlink" in cellValue) {
      return (
        (cellValue as { text?: string; hyperlink?: string }).text ||
        (cellValue as { hyperlink?: string }).hyperlink
      );
    }
  }

  return cellValue;
}

async function parseExcelToJson(file: File): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("No worksheet found in the uploaded file.");
  }

  const headerRow = worksheet.getRow(1);
  const headerValues = Array.isArray(headerRow.values)
    ? (headerRow.values as ExcelJS.CellValue[])
    : [];
  const headers = headerValues
    .slice(1)
    .map((value: ExcelJS.CellValue) =>
      String(normalizeExcelCellValue(value) || "").trim(),
    );

  const rows: any[] = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    const record: Record<string, unknown> = {};
    let hasData = false;

    headers.forEach((header: string, index: number) => {
      if (!header) return;
      const value = normalizeExcelCellValue(row.getCell(index + 1).value);
      if (value !== undefined && value !== null && value !== "") {
        hasData = true;
      }
      record[header] = value;
    });

    if (hasData) {
      rows.push(record);
    }
  }

  return rows;
}

function parseCsvToJson(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve((results.data as any[]) || []),
      error: (error) => reject(error),
    });
  });
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
        title: t("Processing File"),
        description: t("Parsing {fileName}...", {
          fileName: fileToProcess.name,
        }),
      });

      const fileName = fileToProcess.name.toLowerCase();
      if (fileName.endsWith(".xlsx")) {
        parseExcelToJson(fileToProcess)
          .then((jsonData) => {
            setParsedData(jsonData);
            toast({
              title: t("Processing Complete"),
              description: t("Please review the data preview below."),
            });
          })
          .catch((error) => {
            handleError(error, t("Error processing spreadsheet."));
          });
      } else if (fileName.endsWith(".csv")) {
        parseCsvToJson(fileToProcess)
          .then((jsonData) => {
            setParsedData(jsonData);
            toast({
              title: t("Processing Complete"),
              description: t("Please review the data preview below."),
            });
          })
          .catch((error) => {
            handleError(error, t("Error processing CSV."));
          });
      } else if (fileToProcess.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const dataUrl = event.target?.result as string;
            if (!dataUrl) throw new Error("Could not read PDF file.");

            toast({
              title: t("Extracting Data from PDF"),
              description: t("This may take a moment..."),
            });

            const result = await extractDataFromPdf({ pdfDataUri: dataUrl });

            if (result && result.data) {
              setParsedData(result.data);
              toast({
                title: t("PDF Processing Complete"),
                description: t(
                  "Please review the extracted data preview below.",
                ),
              });
            } else {
              throw new Error("AI could not extract data from the PDF.");
            }
          } catch (error) {
            handleError(error, t("Error processing PDF."));
          }
        };
        reader.readAsDataURL(fileToProcess);
      } else {
        toast({
          title: t("Unsupported File Type"),
          description: t("Please upload a CSV, XLSX, or PDF file."),
          variant: "destructive",
        });
      }
    });
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        toast({
          title: t("File Upload Error"),
          description: t("Please upload only one file at a time."),
          variant: "destructive",
        });
        return;
      }
      const newFile = acceptedFiles[0];
      setFile(newFile);
      setParsedData([]); // Reset preview
      if (newFile) {
        processFile(newFile);
      }
    },
    [toast, t], // removed processFile from dependency array to avoid re-creation on every render
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const handleError = (error: any, title: string) => {
    console.error(title, error);
    toast({
      title: title,
      description:
        (error as Error).message || t("An unexpected error occurred."),
      variant: "destructive",
    });
  };

  const handleSave = () => {
    if (parsedData.length === 0) {
      toast({
        title: t("No Data to Save"),
        description: t("Please process a file before saving."),
        variant: "destructive",
      });
      return;
    }

    startSaving(async () => {
      toast({
        title: t("Saving Data"),
        description: t("Submitting records to the database..."),
      });
      try {
        if (!firestore) throw new Error("Firestore not available");
        const recordsAdded = await uploadPerformanceData(firestore, parsedData);

        if (recordsAdded > 0) {
          toast({
            title: t("Save Successful"),
            description: t("{count} records uploaded successfully.", {
              count: recordsAdded,
            }),
          });
          setFile(null); // Clear file and data after successful save
          setParsedData([]);
        } else {
          throw new Error(
            t(
              "Upload failed. No valid records with recognizable districts and dates were found in the file. Please check the file content and format.",
            ),
          );
        }
      } catch (error) {
        handleError(error, t("Save Failed"));
      }
    });
  };

  const loading = isProcessing || isSaving;
  const loadingText = isProcessing ? t("Processing...") : t("Saving...");

  return (
    <div className="grid gap-5 sm:gap-6">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full p-6 sm:p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
        } ${loading ? "pointer-events-none opacity-50" : ""}`}
      >
        <input {...getInputProps()} disabled={loading} />
        <UploadCloud className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
        {isDragActive ? (
          <p className="mt-4 text-base sm:text-lg font-semibold text-primary text-center">
            {t("Drop the file here...")}
          </p>
        ) : (
          <>
            <p className="mt-4 text-base sm:text-lg font-semibold text-foreground text-center">
              {loading
                ? loadingText
                : t("Drag & drop your file here, or click to select")}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground text-center">
              {t("(CSV, XLS, XLSX or PDF files)")}
            </p>
          </>
        )}
      </div>
      {file && !isProcessing && (
        <div className="text-center text-sm text-muted-foreground">
          {t("Selected file")}: <strong>{file.name}</strong>
        </div>
      )}

      <DataPreview data={parsedData} />

      {parsedData.length > 0 && (
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full md:w-auto mx-auto"
        >
          {isSaving ? t("Saving Records...") : t("Save Records")}
        </Button>
      )}
    </div>
  );
}
