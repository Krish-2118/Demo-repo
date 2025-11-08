
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Filters } from '@/components/dashboard/filters';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DistrictComparisonChart } from '@/components/dashboard/district-comparison-chart';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { Target, Trophy, Box, UserCheck, Shield, Shovel, Siren, Search, Skull, Building, HeartHandshake, Fingerprint, CarFront, ClipboardList } from 'lucide-react';
import { AiSummary } from '@/components/dashboard/ai-summary';
import type { Record as PerformanceRecord, Category, PerformanceMetric } from '@/lib/types';
import { districts, categoryLabels } from '@/lib/data';
import type { DateRange } from 'react-day-picker';
import { subMonths, startOfMonth, endOfMonth, isWithinInterval, endOfDay } from 'date-fns';
import { useCollection } from '@/hooks/use-collection';
import { collection, query, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/client';
import { useTranslation } from '@/context/translation-context';

const iconMap: Record<Category, React.ReactNode> = {
  'NBW': <Target className="h-4 w-4 text-muted-foreground" />,
  'Conviction': <Trophy className="h-4 w-4 text-muted-foreground" />,
  'Narcotics': <Box className="h-4 w-4 text-muted-foreground" />,
  'Missing Person': <UserCheck className="h-4 w-4 text-muted-foreground" />,
  'Firearms': <Shield className="h-4 w-4 text-muted-foreground" />,
  'Sand Mining': <Shovel className="h-4 w-4 text-muted-foreground" />,
  'Preventive Actions': <Siren className="h-4 w-4 text-muted-foreground" />,
  'Important Detections': <Search className="h-4 w-4 text-muted-foreground" />,
  'Heinous Crime Cases': <Skull className="h-4 w-4 text-muted-foreground" />,
  'Property Crime Cases': <Building className="h-4 w-4 text-muted-foreground" />,
  'Crime Against Women': <HeartHandshake className="h-4 w-4 text-muted-foreground" />,
  'Cybercrime': <Fingerprint className="h-4 w-4 text-muted-foreground" />,
  'Road Accidents': <CarFront className="h-4 w-4 text-muted-foreground" />,
  'Others': <ClipboardList className="h-4 w-4 text-muted-foreground" />,
};

// This function converts Firestore Timestamps to Date objects
const processRecords = (records: any[] | null): PerformanceRecord[] => {
    if (!records) return [];
    return records.map(r => {
        let date = r.date;
        if (date && typeof date.toDate === 'function') {
            date = date.toDate();
        }
        return {
            ...r,
            id: r.id,
            date: date as Date,
            casesRegistered: r.casesRegistered || 0,
            casesSolved: r.casesSolved || 0,
        };
    }).filter(r => r.date instanceof Date && !isNaN(r.date.getTime()));
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [filters, setFilters] = useState<{
    district: string;
    category: Category | 'all';
    dateRange: DateRange;
  }>({
    district: 'all',
    category: 'all',
    dateRange: { from: undefined, to: undefined },
  });
  
  const [isDateRangeSet, setIsDateRangeSet] = useState(false);

  const firestore = useFirestore();
  const recordsQuery = useMemo(() => firestore ? query(collection(firestore, 'records')) : null, [firestore]);
  const { data: allRecords, loading: recordsLoading } = useCollection(recordsQuery);

  const processedRecords = useMemo(() => processRecords(allRecords), [allRecords]);
  
  useEffect(() => {
      setIsClient(true);
  }, []);

  useEffect(() => {
    if (processedRecords.length > 0 && !isDateRangeSet) {
      const dates = processedRecords.map(r => r.date.getTime()).filter(t => !isNaN(t));
      if(dates.length > 0) {
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        
        setFilters(prevFilters => ({
          ...prevFilters,
          dateRange: { from: minDate, to: maxDate }
        }));
        setIsDateRangeSet(true);
      }
    }
  }, [processedRecords, isDateRangeSet]);

  const previousMonthDateRange = useMemo(() => {
    if (!filters.dateRange.from) return { from: undefined, to: undefined };
    const prevMonth = subMonths(filters.dateRange.from, 1);
    return {
      from: startOfMonth(prevMonth),
      to: endOfMonth(prevMonth)
    }
  }, [filters.dateRange.from]);

  const filteredRecords = useMemo(() => {
    if (!processedRecords) return [];
    
    const selectedDistrictId = filters.district === 'all' 
      ? null 
      : districts.find(d => d.name.toLowerCase() === filters.district)?.id;

    return processedRecords.filter(r => {
      const isDistrictMatch = filters.district === 'all' || r.districtId === selectedDistrictId;
      const isCategoryMatch = filters.category === 'all' || r.category === filters.category;
      
      const isDateInRange = filters.dateRange.from && r.date instanceof Date
        ? isWithinInterval(r.date, { 
            start: filters.dateRange.from, 
            end: endOfDay(filters.dateRange.to || filters.dateRange.from) 
          })
        : true; 

      return isDistrictMatch && isCategoryMatch && isDateInRange;
    });
  }, [processedRecords, filters.district, filters.category, filters.dateRange]);

  const prevMonthRecords = useMemo(() => {
     if (!previousMonthDateRange.from || !previousMonthDateRange.to || !processedRecords) return [];
     const selectedDistrictId = filters.district === 'all' ? null : districts.find(d => d.name.toLowerCase() === filters.district)?.id;
     return processedRecords.filter(r => 
       (filters.district === 'all' || r.districtId === selectedDistrictId) &&
       r.date instanceof Date && isWithinInterval(r.date, { start: previousMonthDateRange.from!, end: previousMonthDateRange.to! })
     );
  }, [processedRecords, previousMonthDateRange, filters.district]);

  const kpiData = useMemo((): PerformanceMetric[] => {
    const categories: Category[] = Object.keys(categoryLabels) as Category[];
    
    return categories.map(category => {
      const currentRegistered = filteredRecords
        .filter(r => r.category === category)
        .reduce((sum, r) => sum + r.casesRegistered, 0);
      const currentSolved = filteredRecords
        .filter(r => r.category === category)
        .reduce((sum, r) => sum + r.casesSolved, 0);
      
      const prevRegistered = prevMonthRecords
        .filter(r => r.category === category)
        .reduce((sum, r) => sum + r.casesRegistered, 0);
      const prevSolved = prevMonthRecords
        .filter(r => r.category === category)
        .reduce((sum, r) => sum + r.casesSolved, 0);

      const solveRate = currentRegistered > 0 ? (currentSolved / currentRegistered) * 100 : 0;
      const previousSolveRate = prevRegistered > 0 ? (prevSolved / prevRegistered) * 100 : 0;
        
      return {
        category,
        label: t(categoryLabels[category]),
        casesRegistered: currentRegistered,
        casesSolved: currentSolved,
        solveRate,
        previousSolveRate,
      };
    });
  }, [filteredRecords, prevMonthRecords, t]);


  const districtPerformance = useMemo(() => {
    const performanceMap = new Map<string, any>();
    
    districts.forEach(d => {
        const initialData: Record<string, number> = {
          'Cases Registered': 0,
          'Cases Solved': 0
        };
        performanceMap.set(d.name, { 
            name: t(d.name), 
            ...initialData
        })
    });

    filteredRecords.forEach(r => {
        const district = districts.find(d => d.id === r.districtId);
        if (district) {
            const current = performanceMap.get(district.name);
            if (current) {
                current['Cases Registered'] += r.casesRegistered;
                current['Cases Solved'] += r.casesSolved;
            }
        }
    });
    return Array.from(performanceMap.values());
  }, [filteredRecords, t]);


  const trendData = useMemo(() => {
    const trendMap = new Map<string, any>();
    const langForFormatter = t('en-US'); // Use a key that can be translated
    
    const monthFormatter = new Intl.DateTimeFormat(langForFormatter, { month: 'short', year: 'numeric' });

    for (let i = 0; i < 6; i++) {
        const date = startOfMonth(subMonths(new Date(), 5 - i));
        const month = monthFormatter.format(date);
        
        trendMap.set(month, { 
          month,
          'Cases Registered': 0,
          'Cases Solved': 0
        });
    }

    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
    const relevantRecords = processedRecords.filter(r => r.date instanceof Date && r.date >= sixMonthsAgo);

    const selectedDistrictId = filters.district === 'all' ? null : districts.find(d => d.name.toLowerCase() === filters.district)?.id;
    const selectedCategory = filters.category;

    relevantRecords.forEach(record => {
      const month = monthFormatter.format(startOfMonth(record.date));
      const monthData = trendMap.get(month);

      if (monthData && (filters.district === 'all' || record.districtId === selectedDistrictId) && (selectedCategory === 'all' || record.category === selectedCategory)) {
        monthData['Cases Registered'] += record.casesRegistered;
        monthData['Cases Solved'] += record.casesSolved;
      }
    });

    return Array.from(trendMap.values());

  }, [processedRecords, filters.district, filters.category, t]);
  
  if (!isClient) {
    return null; // Render nothing on the server
  }

  return (
    <div className="flex-1 space-y-4">
      <Filters onFilterChange={setFilters} initialFilters={filters} allRecords={processedRecords ?? []} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kpiData.map((metric) => (
          <KpiCard key={metric.category} metric={metric} icon={iconMap[metric.category]} isLoading={recordsLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AiSummary districtPerformance={kpiData} isLoading={recordsLoading} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DistrictComparisonChart 
            data={districtPerformance} 
            isLoading={recordsLoading}
        />
        <TrendChart 
            data={trendData} 
            isLoading={recordsLoading}
        />
      </div>
    </div>
  );
}

    