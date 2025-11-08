'use client';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { KpiCard } from './kpi-card';
import { Skeleton } from '../ui/skeleton';
import type { PerformanceMetric, Category } from '@/lib/types';

interface CaseDetailsGroupProps {
    metrics: PerformanceMetric[];
    iconMap: Record<Category, React.ReactNode>;
    isLoading: boolean;
}

export function CaseDetailsGroup({ metrics, iconMap, isLoading }: CaseDetailsGroupProps) {
    if (isLoading) {
        return (
             <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-4 pb-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="min-w-[280px]">
                            <Card className="rounded-xl shadow-lg">
                                <div className="p-4">
                                    <Skeleton className="h-6 w-3/4 mb-4" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        )
    }
    
    return (
        <ScrollArea className="w-full whitespace-nowrap rounded-lg border border-border/50 bg-card shadow-sm">
            <div className="flex w-max space-x-4 p-4">
                {metrics.map((metric) => (
                    <div key={metric.category} className="min-w-[280px]">
                         <KpiCard metric={metric} icon={iconMap[metric.category]} isLoading={isLoading} className="border-0 shadow-none"/>
                    </div>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
