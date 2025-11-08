'use client';
import { useState, useMemo, useEffect } from 'react';
import { Filters } from '@/components/dashboard/filters';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DistrictComparisonChart } from '@/components/dashboard/district-comparison-chart';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { Box, Target, Trophy, UserCheck } from 'lucide-react';
import { AiSummary } from '@/components/dashboard/ai-summary';
import type { Record as PerformanceRecord, Category, PerformanceMetric } from '@/lib/types';
import { districts, categoryLabels } from '@/lib/data';
import type { DateRange } from 'react-day-picker';
import { subMonths, startOfMonth, endOfMonth, format, isWithinInterval } from 'date-fns';
import { useCollection } from '@/hooks/use-collection';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/client';

const iconMap: Record<Category, React.ReactNode> = {
  'NBW': <Target className="h-4 w-4 text-muted-foreground" />,
  'Conviction': <Trophy className="h-4 w-4 text-muted-foreground" />,
  'Narcotics': <Box className="h-4 w-4 text-muted-foreground" />,
  'Missing Person': <UserCheck className="h-4 w-4 text-muted-foreground" />,
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
        };
    }).filter(r => r.date instanceof Date && !isNaN(r.date.getTime()));
};

export default function DashboardPage() {
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
    if (processedRecords.length > 0 && !isDateRangeSet) {
      const dates = processedRecords.map(r => r.date.getTime());
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      
      setFilters(prevFilters => ({
        ...prevFilters,
        dateRange: { from: minDate, to: maxDate }
      }));
      setIsDateRangeSet(true);
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
    return processedRecords.filter(r => 
      (filters.district === 'all' || r.districtId === parseInt(districts.find(d => d.name.toLowerCase() === filters.district)?.id.toString() || '0')) &&
      (filters.category === 'all' || r.category === filters.category) &&
      (filters.dateRange.from && filters.dateRange.to && r.date instanceof Date && isWithinInterval(r.date, { start: filters.dateRange.from, end: filters.dateRange.to }))
    );
  }, [processedRecords, filters.district, filters.category, filters.dateRange]);

  const prevMonthRecords = useMemo(() => {
     if (!previousMonthDateRange.from || !previousMonthDateRange.to) return [];
     return processedRecords.filter(r => 
       r.date instanceof Date && isWithinInterval(r.date, { start: previousMonthDateRange.from!, end: previousMonthDateRange.to! })
     );
  }, [processedRecords, previousMonthDateRange]);

  const kpiData = useMemo((): PerformanceMetric[] => {
    const categories: Category[] = ['NBW', 'Conviction', 'Narcotics', 'Missing Person'];
    return categories.map(category => {
      const currentMonthValue = filteredRecords
        .filter(r => r.category === category)
        .reduce((sum, r) => sum + r.value, 0);

      const prevMonthValue = prevMonthRecords
        .filter(r => 
            (filters.district === 'all' || r.districtId === parseInt(districts.find(d => d.name.toLowerCase() === filters.district)?.id.toString() || '0')) &&
            r.category === category
        )
        .reduce((sum, r) => sum + r.value, 0);

      const change = prevMonthValue > 0 
        ? ((currentMonthValue - prevMonthValue) / prevMonthValue) * 100 
        : currentMonthValue > 0 ? 100 : 0;
        
      return {
        category,
        label: categoryLabels[category],
        value: currentMonthValue,
        change: change,
      };
    });
  }, [filteredRecords, prevMonthRecords, filters.district]);

  const districtPerformance = useMemo(() => {
    const performanceMap = new Map<string, any>();
    districts.forEach(d => performanceMap.set(d.name, { name: d.name, NBW: 0, Conviction: 0, Narcotics: 0, 'Missing Person': 0 }));

    filteredRecords.forEach(r => {
        const district = districts.find(d => d.id === r.districtId);
        if (district) {
            const current = performanceMap.get(district.name);
            if (current) {
                current[r.category] = (current[r.category] || 0) + r.value;
            }
        }
    });

    return Array.from(performanceMap.values());
  }, [filteredRecords]);


  const trendData = useMemo(() => {
    const trendMap = new Map<string, any>();
    
    // Initialize months
    for (let i = 0; i < 6; i++) {
        const date = startOfMonth(subMonths(new Date(), 5 - i));
        const month = format(date, 'MMM yyyy');
        trendMap.set(month, { month, NBW: 0, Conviction: 0, Narcotics: 0, 'Missing Person': 0 });
    }

    // Filter records for the last 6 months
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
    const relevantRecords = processedRecords.filter(r => r.date instanceof Date && r.date >= sixMonthsAgo);

    // Aggregate data
    relevantRecords.forEach(record => {
      const month = format(startOfMonth(record.date), 'MMM yyyy');
      const monthData = trendMap.get(month);
      if (monthData && (filters.district === 'all' || record.districtId === parseInt(districts.find(d => d.name.toLowerCase() === filters.district)?.id.toString() || '0'))) {
        monthData[record.category] += record.value;
      }
    });

    return Array.from(trendMap.values());

  }, [processedRecords, filters.district]);

  return (
    <div className="flex-1 space-y-4">
      <Filters onFilterChange={setFilters} initialFilters={filters} allRecords={filteredRecords ?? []} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((metric) => (
          <KpiCard key={metric.category} metric={metric} icon={iconMap[metric.category]} isLoading={recordsLoading} />
        ))}
      </div>
      <div className="grid gap-4">
        <AiSummary kpiData={kpiData} isLoading={recordsLoading} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <DistrictComparisonChart data={districtPerformance} isLoading={recordsLoading} />
        <TrendChart data={trendData} isLoading={recordsLoading} />
      </div>
    </div>
  );
}
