"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  Download,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { format, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { districts, categoryLabels } from "@/lib/data";
import type { Category, Record } from "@/lib/types";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase/client";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { useTranslation } from "@/context/translation-context";

type FiltersProps = {
  onFilterChange: (filters: {
    district: string;
    category: Category | "all";
    dateRange: DateRange;
  }) => void;
  initialFilters: {
    district: string;
    category: Category | "all";
    dateRange: DateRange;
  };
  allRecords: Record[];
};

export function Filters({
  onFilterChange,
  initialFilters,
  allRecords,
}: FiltersProps) {
  const [district, setDistrict] = React.useState(initialFilters.district);
  const [category, setCategory] = React.useState<Category | "all">(
    initialFilters.category,
  );
  const [date, setDate] = React.useState<DateRange | undefined>(
    initialFilters.dateRange,
  );
  const [isExportPending, startExportTransition] = useTransition();
  const [isCleanPending, startCleanTransition] = useTransition();
  const [isCleanConfirmOpen, setIsCleanConfirmOpen] = React.useState(false);

  const { toast } = useToast();
  const firestore = useFirestore();
  const { t } = useTranslation();

  React.useEffect(() => {
    onFilterChange({
      district,
      category,
      dateRange: date || { from: undefined, to: undefined },
    });
  }, [district, category, date, onFilterChange]);

  const handleExportExcel = () => {
    startExportTransition(async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(t("PerformanceData"));
      const headers = [
        t("District"),
        t("Category"),
        t("Cases Registered"),
        t("Cases Solved"),
        t("Date"),
      ];
      worksheet.addRow(headers);

      allRecords.forEach((record) => {
        worksheet.addRow([
          t(
            districts.find((d) => d.id === record.districtId)?.name ||
              "Unknown",
          ),
          t(record.category),
          record.casesRegistered,
          record.casesSolved,
          record.date
            ? format(new Date(record.date as Date), "yyyy-MM-dd")
            : "",
        ]);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileBlob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        fileBlob,
        `${t("PolicePerformanceReport")}_${format(new Date(), "yyyyMMdd")}.xlsx`,
      );
    });
  };

  const handleExportPdf = () => {
    startExportTransition(() => {
      try {
        const doc = new jsPDF();
        const tableColumn = [
          t("District"),
          t("Category"),
          t("Cases Registered"),
          t("Cases Solved"),
          t("Date"),
        ];
        const tableRows: any[][] = [];

        const dataToExport = allRecords.map((record) => [
          t(
            districts.find((d) => d.id === record.districtId)?.name ||
              "Unknown",
          ),
          t(record.category),
          record.casesRegistered,
          record.casesSolved,
          record.date
            ? format(new Date(record.date as Date), "yyyy-MM-dd")
            : "",
        ]);

        tableRows.push(...dataToExport);

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 20,
        });
        doc.text(t("Police Performance Report"), 14, 15);
        doc.save(
          `${t("PolicePerformanceReport")}_${format(new Date(), "yyyyMMdd")}.pdf`,
        );
      } catch (error) {
        console.error("Error exporting PDF:", error);
        toast({
          title: t("Error"),
          description: t("Failed to export PDF. Please try again."),
          variant: "destructive",
        });
      }
    });
  };

  const handleCleanData = () => {
    startCleanTransition(async () => {
      if (!firestore) {
        toast({
          title: t("Error"),
          description: t("Firestore not available."),
          variant: "destructive",
        });
        return;
      }

      const queries = [];

      if (district !== "all") {
        const selectedDistrict = districts.find(
          (d) => d.name.toLowerCase() === district,
        );
        if (selectedDistrict) {
          queries.push(where("districtId", "==", selectedDistrict.id));
        }
      }
      if (category !== "all") {
        queries.push(where("category", "==", category));
      }

      let startDate = date?.from;
      let endDate = date?.to;

      if (startDate && !endDate) {
        endDate = endOfDay(startDate);
      } else if (endDate) {
        endDate = endOfDay(endDate);
      }

      if (startDate) {
        queries.push(where("date", ">=", Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        queries.push(where("date", "<=", Timestamp.fromDate(endDate)));
      }

      try {
        const recordsRef = collection(firestore, "records");
        const q =
          queries.length > 0
            ? query(recordsRef, ...queries)
            : query(recordsRef);

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          toast({
            title: t("No Data Found"),
            description: t("No records match the selected filters."),
          });
          return;
        }

        const batch = writeBatch(firestore);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();

        toast({
          title: t("Success"),
          description: t("{count} records have been deleted successfully.", {
            count: querySnapshot.size,
          }),
        });
      } catch (error) {
        console.error("Error cleaning data:", error);
        toast({
          title: t("Error"),
          description: t("Failed to clean data. Please try again."),
          variant: "destructive",
        });
      } finally {
        setIsCleanConfirmOpen(false);
      }
    });
  };

  const getCleanConfirmationDescription = () => {
    let description = t("This will permanently delete ");
    const parts = [];

    if (district !== "all") {
      const selectedDistrict = districts.find(
        (d) => d.name.toLowerCase() === district,
      );
      parts.push(
        t('records for the "{districtName}" district', {
          districtName: t(selectedDistrict?.name || ""),
        }),
      );
    }

    if (category !== "all") {
      parts.push(
        t('records in the "{categoryName}" category', {
          categoryName: t(categoryLabels[category]),
        }),
      );
    }

    if (date?.from) {
      if (date.to) {
        parts.push(
          t("between {startDate} and {endDate}", {
            startDate: format(date.from, "LLL dd, y"),
            endDate: format(date.to, "LLL dd, y"),
          }),
        );
      } else {
        parts.push(t("on {date}", { date: format(date.from, "LLL dd, y") }));
      }
    }

    if (parts.length === 0) {
      return t(
        "This will permanently delete ALL records in the database. This action cannot be undone.",
      );
    }

    description += parts.join(t(" and "));
    description += t(". This action cannot be undone.");
    return description;
  };

  return (
    <>
      <div className="surface-panel p-3 sm:p-4 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col lg:flex-row items-stretch gap-3 sm:gap-4 w-full xl:w-auto">
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="w-full lg:w-[190px]">
              <SelectValue placeholder={t("Select District")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Districts")}</SelectItem>
              {districts.map((d) => (
                <SelectItem key={d.id} value={d.name.toLowerCase()}>
                  {t(d.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={category}
            onValueChange={(value) => setCategory(value as Category | "all")}
          >
            <SelectTrigger className="w-full lg:w-[210px]">
              <SelectValue placeholder={t("Select Category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Categories")}</SelectItem>
              {(Object.keys(categoryLabels) as Category[]).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {t(categoryLabels[cat])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className={cn("grid gap-2 w-full")}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full lg:w-[320px] justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>{t("Pick a date")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex w-full xl:w-auto flex-col sm:flex-row gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={isExportPending}
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExportPending ? t("Exporting...") : t("Export")}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                {t("Export as Excel (.xlsx)")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPdf}>
                {t("Export as PDF (.pdf)")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setIsCleanConfirmOpen(true)}
            variant="destructive"
            disabled={isCleanPending}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isCleanPending ? t("Cleaning...") : t("Clean Data")}
          </Button>
        </div>
      </div>
      <AlertDialog
        open={isCleanConfirmOpen}
        onOpenChange={setIsCleanConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Are you absolutely sure?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {getCleanConfirmationDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCleanData}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              {isCleanPending ? t("Cleaning...") : t("Yes, delete data")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
