'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

interface DistrictComparisonChartProps {
    data: any[];
    isLoading: boolean;
}

export function DistrictComparisonChart({ data, isLoading }: DistrictComparisonChartProps) {
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
        <CardTitle>District-wise Comparison</CardTitle>
        <CardDescription>Performance across all categories</CardDescription>
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
            <Bar dataKey="NBW" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Conviction" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Narcotics" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Missing Person" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
