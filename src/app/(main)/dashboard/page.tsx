'use client';
import { useState, useMemo } from 'react';
import { Filters } from '@/components/dashboard/filters';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DistrictComparisonChart } from '@/components/dashboard/district-comparison-chart';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { Box, Target, Trophy, UserCheck } from 'lucide-react';
import { AiSummary } from '@/components/dashboard/ai-summary';
import { useCollection, useMemoFirebase } from '@/firebase';
import type { Record as PerformanceRecord, Category, PerformanceMetric } from '@/lib/types';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { districts, categoryLabels } from '@/lib/data';
import type { DateRange } from 'react-day-picker';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

const iconMap: Record<Category, React.ReactNode> = {
  'NBW': <Target className="h-4 w-4 text-muted-foreground" />,
  'Conviction': <Trophy className="h-4 w-4 text-muted-foreground" />,
  'Narcotics': <Box className="h-4 w-4 text-muted-foreground" />,
  'Missing Person': <UserCheck className="h-4 w-4 text-muted-foreground" />,
};

export default function DashboardPage() {
  const firestore = useFirestore();
  
  const [filters, setFilters] = useState({
    district: 'all',
    category: 'all' as Category | 'all',
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    } as DateRange,
  });

  const recordsQuery = useMemoFirebase(() => {
    let q = collection(firestore, 'records');

    if (filters.dateRange.from && filters.dateRange.to) {
        const start = filters.dateRange.from.toISOString();
        const end = filters.dateRange.to.toISOString();
        return query(q, where('date', '>=', start), where('date', '<=', end));
    }
    return collection(firestore, 'records');
  }, [firestore, filters.dateRange]);
  
  const { data: records, isLoading: recordsLoading } = useCollection<PerformanceRecord>(recordsQuery);

  const previousMonthDateRange = useMemo(() => {
    if (!filters.dateRange.from) return { from: null, to: null };
    const prevMonth = subMonths(filters.dateRange.from, 1);
    return {
      from: startOfMonth(prevMonth),
      to: endOfMonth(prevMonth)
    }
  }, [filters.dateRange.from]);

  const prevRecordsQuery = useMemoFirebase(() => {
    if (!previousMonthDateRange.from || !previousMonthDateRange.to) return null;
    const start = previousMonthDateRange.from.toISOString();
    const end = previousMonthDateRange.to.toISOString();
    return query(collection(firestore, 'records'), where('date', '>=', start), where('date', '<=', end));
  }, [firestore, previousMonthDateRange]);

  const { data: prevRecords } = useCollection<PerformanceRecord>(prevRecordsQuery);

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter(r => 
      (filters.district === 'all' || r.districtId === parseInt(districts.find(d => d.name.toLowerCase() === filters.district)?.id.toString() || '0')) &&
      (filters.category === 'all' || r.category === filters.category)
    );
  }, [records, filters.district, filters.category]);

  const kpiData = useMemo((): PerformanceMetric[] => {
    const categories: Category[] = ['NBW', 'Conviction', 'Narcotics', 'Missing Person'];
    return categories.map(category => {
      const currentMonthValue = filteredRecords
        .filter(r => r.category === category)
        .reduce((sum, r) => sum + r.value, 0);

      const prevMonthValue = (prevRecords || [])
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
  }, [filteredRecords, prevRecords, filters.district]);

  const districtPerformance = useMemo(() => {
    if (!records) return [];
    const performanceMap = new Map<string, any>();
    districts.forEach(d => performanceMap.set(d.name, { name: d.name, NBW: 0, Conviction: 0, Narcotics: 0, 'Missing Person': 0 }));

    records.forEach(r => {
        const district = districts.find(d => d.id === r.districtId);
        if (district) {
            const current = performanceMap.get(district.name);
            if (current) {
                current[r.category] = (current[r.category] || 0) + r.value;
            }
        }
    });

    return Array.from(performanceMap.values());
  }, [records]);


  const trendData = useMemo(() => {
    if (!records) return [];
    const trendMap = new Map<string, any>();

    records.forEach(record => {
      const month = format(new Date(record.date), 'MMM yyyy');
      if (!trendMap.has(month)) {
        trendMap.set(month, { month, NBW: 0, Conviction: 0, Narcotics: 0, 'Missing Person': 0 });
      }
      const monthData = trendMap.get(month);
      monthData[record.category] = (monthData[record.category] || 0) + record.value;
    });

    return Array.from(trendMap.values()).sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  }, [records]);

  return (
    <div className="flex-1 space-y-4">
      <Filters onFilterChange={setFilters} initialFilters={filters} allRecords={records ?? []} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((metric) => (
          <KpiCard key={metric.category} metric={metric} icon={iconMap[metric.category]} isLoading={recordsLoading} />
        ))}
      </div>
      <div className="grid gap-4">
        <AiSummary />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <DistrictComparisonChart data={districtPerformance} isLoading={recordsLoading} />
        <TrendChart data={trendData} isLoading={recordsLoading} />
      </div>
    </div>
  );
}
