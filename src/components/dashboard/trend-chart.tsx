'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trendData } from '@/lib/data';

export function TrendChart() {
  return (
    <Card className="rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle>Month-wise Trend</CardTitle>
        <CardDescription>Performance trends over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            />
            <Legend wrapperStyle={{fontSize: "12px"}} />
            <Line type="monotone" dataKey="NBW" stroke="hsl(var(--chart-1))" strokeWidth={2} />
            <Line type="monotone" dataKey="Conviction" stroke="hsl(var(--chart-2))" strokeWidth={2} />
            <Line type="monotone" dataKey="Narcotics" stroke="hsl(var(--chart-3))" strokeWidth={2} />
            <Line type="monotone" dataKey="Missing Person" stroke="hsl(var(--chart-4))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
