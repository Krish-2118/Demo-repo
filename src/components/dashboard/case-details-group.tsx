'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { KpiCard } from './kpi-card';
import { Skeleton } from '../ui/skeleton';
import { FolderKanban } from 'lucide-react';
import type { PerformanceMetric, Category } from '@/lib/types';
import { useTranslation } from '@/context/translation-context';


interface CaseDetailsGroupProps {
    metrics: PerformanceMetric[];
    iconMap: Record<Category, React.ReactNode>;
    isLoading: boolean;
}

export function CaseDetailsGroup({ metrics, iconMap, isLoading }: CaseDetailsGroupProps) {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <Card className="rounded-xl shadow-lg">
                <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </Card>
        )
    }
    
    return (
        <Card className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 col-span-1 md:col-span-2 lg:col-span-1">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="p-6 text-sm font-medium hover:no-underline">
                       <div className="flex flex-row items-center justify-between w-full">
                            <span>{t('Case Details')}</span>
                            <FolderKanban className="h-4 w-4 text-muted-foreground" />
                       </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-0">
                        <div className="grid gap-4">
                            {metrics.map((metric) => (
                                <KpiCard key={metric.category} metric={metric} icon={iconMap[metric.category]} isLoading={isLoading} className="shadow-none border-0 bg-background/50" />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
}
