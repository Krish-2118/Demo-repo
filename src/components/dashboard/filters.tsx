'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import * as XLSX from 'xlsx';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { districts, categoryLabels } from '@/lib/data';
import type { Category, Record } from '@/lib/types';
import { useTransition } from 'react';

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
  const [isPending, startTransition] = useTransition();


  React.useEffect(() => {
    onFilterChange({ district, category, dateRange: date || {from: undefined, to: undefined} });
  }, [district, category, date, onFilterChange]);


  const handleExport = () => {
    startTransition(() => {
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

  return (
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
      <Button onClick={handleExport} disabled={isPending}>
        <Download className="mr-2 h-4 w-4" />
        {isPending ? 'Exporting...' : 'Export Report'}
      </Button>
    </div>
  );
}
