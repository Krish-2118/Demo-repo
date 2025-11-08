'use client';
import { useEffect, useState, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateDistrictPerformanceSummary } from '@/ai/flows/generate-district-performance-summary';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import type { PerformanceMetric } from '@/lib/types';

interface AiSummaryProps {
  kpiData: PerformanceMetric[];
  isLoading: boolean;
}

export function AiSummary({ kpiData, isLoading }: AiSummaryProps) {
  const [summary, setSummary] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleGenerateSummary = useCallback(() => {
    if (!kpiData || kpiData.some(d => d.value === 0)) {
        setSummary('Not enough data to generate an insight. Please select a different date range or district.');
        return;
    }
    
    startTransition(async () => {
      try {
        const result = await generateDistrictPerformanceSummary({ kpiData });
        setSummary(result.summary);
      } catch (error) {
        console.error('Error generating AI summary:', error);
        setSummary('Could not generate an AI insight at this time.');
      }
    });
  }, [kpiData]);

  useEffect(() => {
    // Generate summary when data is loaded and available
    if (!isLoading && kpiData && kpiData.length > 0) {
      handleGenerateSummary();
    }
  }, [isLoading, kpiData, handleGenerateSummary]);

  return (
    <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20 rounded-xl shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg text-primary/90 dark:text-primary-foreground/90">AI Insight Summary</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGenerateSummary}
          disabled={isPending || isLoading}
        >
          <RefreshCw
            className={cn('h-4 w-4 text-muted-foreground', isPending && 'animate-spin')}
          />
        </Button>
      </CardHeader>
      <CardContent>
        {isPending || isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <p className="text-sm text-foreground/80">{summary}</p>
        )}
      </CardContent>
    </Card>
  );
}
