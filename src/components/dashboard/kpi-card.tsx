import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PerformanceMetric } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

type KpiCardProps = {
  metric: PerformanceMetric;
  icon: React.ReactNode;
};

export function KpiCard({ metric, icon }: KpiCardProps) {
  const ChangeIcon =
    metric.change > 0
      ? ArrowUpRight
      : metric.change < 0
      ? ArrowDownRight
      : Minus;

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
            metric.change > 0 ? 'text-green-600' : 'text-red-600'
          )}
        >
          <ChangeIcon className="h-4 w-4 mr-1" />
          {metric.change.toFixed(1)}% from last month
        </p>
      </CardContent>
    </Card>
  );
}
