'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from '@/context/translation-context';
import { categoryLabels } from '@/lib/data';

interface DistrictComparisonChartProps {
    data: any[];
    isLoading: boolean;
}

export function DistrictComparisonChart({ data, isLoading }: DistrictComparisonChartProps) {
  const { t } = useTranslation();
  if (isLoading) {
      return (
        <Card className="rounded-xl shadow-lg">
            <CardHeader>
                <Skeleton className="h-6 w-3/5" />
                <Skeleton className="h-4 w-4/5" />
            </CardHeader>
            <CardContent>
                <Skeleton className="w-full h-[350px]" />
            </CardContent>
        </Card>
      )
  }
  return (
    <Card className="rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle>{t('District-wise Comparison')}</CardTitle>
        <CardDescription>{t('Performance across key categories')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            />
            <Legend wrapperStyle={{fontSize: "12px"}}/>
            <Bar dataKey={t(categoryLabels['NBW'])} fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name={t(categoryLabels['NBW'])} />
            <Bar dataKey={t(categoryLabels['Conviction'])} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name={t(categoryLabels['Conviction'])} />
            <Bar dataKey={t(categoryLabels['Narcotics'])} fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name={t(categoryLabels['Narcotics'])} />
            <Bar dataKey={t(categoryLabels['Missing Person'])} fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} name={t(categoryLabels['Missing Person'])} />
            <Bar dataKey={t(categoryLabels['Others'])} fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} name={t(categoryLabels['Others'])} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
