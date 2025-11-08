import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PerformanceMetric } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from '@/context/translation-context';

type KpiCardProps = {
  metric: PerformanceMetric;
  icon: React.ReactNode;
  isLoading: boolean;
};

export function KpiCard({ metric, icon, isLoading }: KpiCardProps) {
  const { t } = useTranslation();
  const ChangeIcon =
    metric.change > 0
      ? ArrowUpRight
      : metric.change < 0
      ? ArrowDownRight
      : Minus;

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-7 w-1/3 mb-2" />
            <Skeleton className="h-3 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
        <p
          className={cn(
            'text-xs text-muted-foreground flex items-center',
            metric.change > 0 ? 'text-green-600' : 'text-red-600',
            metric.change === 0 && 'text-muted-foreground'
          )}
        >
          <ChangeIcon className="h-4 w-4 mr-1" />
          {Math.abs(metric.change).toFixed(1)}% {t('from last month')}
        </p>
      </CardContent>
    </Card>
  );
}
