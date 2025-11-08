'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, Download, Trash2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { districts, categoryLabels } from '@/lib/data';
import type { Category, Record } from '@/lib/types';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase/client';
import { collection, query, where, getDocs, writeBatch, Timestamp, endOfDay } from 'firebase/firestore';


type FiltersProps = {
  onFilterChange: (filters: {
    district: string;
    category: Category | 'all';
    dateRange: DateRange;
  }) => void;
  initialFilters: {
    district: string;
    category: Category | 'all';
    dateRange: DateRange;
  };
  allRecords: Record[];
};

export function Filters({ onFilterChange, initialFilters, allRecords }: FiltersProps) {
  const [district, setDistrict] = React.useState(initialFilters.district);
  const [category, setCategory] = React.useState<Category | 'all'>(
    initialFilters.category
  );
  const [date, setDate] = React.useState<DateRange | undefined>(
    initialFilters.dateRange
  );
  const [isExportPending, startExportTransition] = useTransition();
  const [isCleanPending, startCleanTransition] = useTransition();
  const [isCleanConfirmOpen, setIsCleanConfirmOpen] = React.useState(false);
  
  const { toast } = useToast();
  const firestore = useFirestore();


  React.useEffect(() => {
    onFilterChange({ district, category, dateRange: date || {} });
  }, [district, category, date, onFilterChange]);


  const handleExportExcel = () => {
    startExportTransition(() => {
        const dataToExport = allRecords.map(record => {
            return {
                District: districts.find(d => d.id === record.districtId)?.name || 'Unknown',
                Category: record.category,
                Value: record.value,
                Date: record.date ? format(new Date(record.date), 'yyyy-MM-dd') : ''
            }
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PerformanceData");
        XLSX.writeFile(workbook, `PolicePerformanceReport_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    });
  };

  const handleExportPdf = () => {
    startExportTransition(() => {
        const doc = new jsPDF();
        const tableColumn = ["District", "Category", "Value", "Date"];
        const tableRows: any[][] = [];

        const dataToExport = allRecords.map(record => ([
            districts.find(d => d.id === record.districtId)?.name || 'Unknown',
            record.category,
            record.value,
            record.date ? format(new Date(record.date), 'yyyy-MM-dd') : ''
        ]));

        tableRows.push(...dataToExport);

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });
        doc.text("Police Performance Report", 14, 15);
        doc.save(`PolicePerformanceReport_${format(new Date(), 'yyyyMMdd')}.pdf`);
    });
  };

  const handleCleanData = () => {
    startCleanTransition(async () => {
        if (!firestore) {
            toast({ title: 'Error', description: 'Firestore not available.', variant: 'destructive'});
            return;
        }

        const queries = [];
        
        if (district !== 'all') {
          const selectedDistrict = districts.find(d => d.name.toLowerCase() === district);
          if (selectedDistrict) {
            queries.push(where('districtId', '==', selectedDistrict.id));
          }
        }
        if (category !== 'all') {
            queries.push(where('category', '==', category));
        }

        let startDate = date?.from;
        let endDate = date?.to;

        if (startDate && !endDate) {
          endDate = endOfDay(startDate);
        }

        if (startDate) {
            queries.push(where('date', '>=', Timestamp.fromDate(startDate)));
        }
        if (endDate) {
            queries.push(where('date', '<=', Timestamp.fromDate(endDate)));
        }

        try {
            const recordsRef = collection(firestore, 'records');
            const q = queries.length > 0 ? query(recordsRef, ...queries) : query(recordsRef);
            
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast({ title: 'No Data Found', description: 'No records match the selected filters.' });
                return;
            }

            const batch = writeBatch(firestore);
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();

            toast({ title: 'Success', description: `${querySnapshot.size} records have been deleted successfully.` });
        } catch (error) {
            console.error('Error cleaning data:', error);
            toast({ title: 'Error', description: 'Failed to clean data. Please try again.', variant: 'destructive' });
        } finally {
            setIsCleanConfirmOpen(false);
        }
    });
  };
  
  const getCleanConfirmationDescription = () => {
    let description = 'This will permanently delete ';
    const parts = [];

    if (district !== 'all') {
      const selectedDistrict = districts.find(d => d.name.toLowerCase() === district);
      parts.push(`records for the "${selectedDistrict?.name}" district`);
    }

    if (category !== 'all') {
      parts.push(`records in the "${categoryLabels[category]}" category`);
    }

    if (date?.from) {
      if (date.to) {
        parts.push(`between ${format(date.from, 'LLL dd, y')} and ${format(date.to, 'LLL dd, y')}`);
      } else {
        parts.push(`on ${format(date.from, 'LLL dd, y')}`);
      }
    }

    if (parts.length === 0) {
      return 'This will permanently delete ALL records in the database. This action cannot be undone.';
    }

    description += parts.join(' and ');
    description += '. This action cannot be undone.';
    return description;
  }

  return (
    <>
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.name.toLowerCase()}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={(value) => setCategory(value as Category | 'all')}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(Object.keys(categoryLabels) as Category[]).map((cat) => (
               <SelectItem key={cat} value={cat}>
                 {categoryLabels[cat]}
               </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className={cn('grid gap-2 w-full md:w-auto')}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={'outline'}
                className={cn(
                  'w-full md:w-[300px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'LLL dd, y')} -{' '}
                      {format(date.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(date.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date</span>
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
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className='flex gap-2'>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExportPending}>
                    <Download className="mr-2 h-4 w-4" />
                    {isExportPending ? 'Exporting...' : 'Export'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportExcel}>
                    Export as Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPdf}>
                    Export as PDF (.pdf)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={() => setIsCleanConfirmOpen(true)} variant="destructive" disabled={isCleanPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            {isCleanPending ? 'Cleaning...' : 'Clean Data'}
        </Button>
      </div>
    </div>
    <AlertDialog open={isCleanConfirmOpen} onOpenChange={setIsCleanConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    {getCleanConfirmationDescription()}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCleanData} className={cn(buttonVariants({variant: 'destructive'}))}>
                    {isCleanPending ? 'Cleaning...' : 'Yes, delete data'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}