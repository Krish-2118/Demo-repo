'use client';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateDistrictPerformanceSummary } from '@/ai/flows/generate-district-performance-summary';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

export function AiSummary() {
  const [summary, setSummary] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleGenerateSummary = () => {
    startTransition(async () => {
      try {
        const result = await generateDistrictPerformanceSummary({
          districtName: 'Ganjam',
          category: 'Narcotics',
          value: 18,
          date: 'May 2023',
          improvementPercentage: 42,
        });
        setSummary(result.summary);
      } catch (error) {
        console.error('Error generating AI summary:', error);
        setSummary('Could not generate summary at this time.');
      }
    });
  };

  useEffect(() => {
    handleGenerateSummary();
  }, []);

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
          disabled={isPending}
        >
          <RefreshCw
            className={cn('h-4 w-4 text-muted-foreground', isPending && 'animate-spin')}
          />
        </Button>
      </CardHeader>
      <CardContent>
        {isPending ? (
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
