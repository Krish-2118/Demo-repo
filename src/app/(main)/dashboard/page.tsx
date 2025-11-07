import { Filters } from '@/components/dashboard/filters';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DistrictComparisonChart } from '@/components/dashboard/district-comparison-chart';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { kpiData } from '@/lib/data';
import { Box, Target, Trophy, UserCheck } from 'lucide-react';
import { AiSummary } from '@/components/dashboard/ai-summary';

const iconMap = {
  'NBW': <Target className="h-4 w-4 text-muted-foreground" />,
  'Conviction': <Trophy className="h-4 w-4 text-muted-foreground" />,
  'Narcotics': <Box className="h-4 w-4 text-muted-foreground" />,
  'Missing Person': <UserCheck className="h-4 w-4 text-muted-foreground" />,
};

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <Filters />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((metric) => (
          <KpiCard key={metric.category} metric={metric} icon={iconMap[metric.category]} />
        ))}
      </div>
      <div className="grid gap-4">
        <AiSummary />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <DistrictComparisonChart />
        <TrendChart />
      </div>
    </div>
  );
}
