'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PerformanceMetric } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from '@/context/translation-context';

type KpiCardProps = {
  metric: PerformanceMetric;
  icon: React.ReactNode;
  isLoading: boolean;
  className?: string;
};

export function KpiCard({ metric, icon, isLoading, className }: KpiCardProps) {
  const { t } = useTranslation();
  const change = metric.solveRate - metric.previousSolveRate;
  
  const ChangeIcon =
    change > 0
      ? TrendingUp
      : change < 0
      ? TrendingDown
      : Minus;

  if (isLoading) {
    return (
      <Card className={cn("w-full rounded-xl shadow-lg", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-2">
            <Skeleton className="h-7 w-1/3" />
            <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/3" />
            </div>
             <Skeleton className="h-3 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{metric.solveRate.toFixed(1)}%</div>
        <p className="text-xs text-muted-foreground">{t('Solve Rate')}</p>
        
        <div className="mt-2 flex justify-between text-xs">
            <div className="flex items-center text-green-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>{t('Registered')}: {metric.casesRegistered}</span>
            </div>
            <div className="flex items-center text-blue-600">
                <ArrowDown className="h-3 w-3 mr-1" />
                <span>{t('Solved')}: {metric.casesSolved}</span>
            </div>
        </div>

        <p
          className={cn(
            'text-xs text-muted-foreground flex items-center mt-1',
            change > 0 ? 'text-green-600' : 'text-red-600',
            change === 0 && 'text-muted-foreground'
          )}
        >
          <ChangeIcon className="h-4 w-4 mr-1" />
          {Math.abs(change).toFixed(1)}% {t('vs last month')}
        </p>
      </CardContent>
    </Card>
  );
}
