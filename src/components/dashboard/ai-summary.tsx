'use client';
import { useEffect, useState, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateDistrictPerformanceSummary, type GenerateDistrictPerformanceSummaryOutput } from '@/ai/flows/generate-district-performance-summary';
import { Lightbulb, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import type { PerformanceMetric } from '@/lib/types';
import { useTranslation } from '@/context/translation-context';

interface AiSummaryProps {
  kpiData: PerformanceMetric[];
  isLoading: boolean;
}

const initialSummaryState: GenerateDistrictPerformanceSummaryOutput = {
    summary: '',
    achievements: [],
    improvements: [],
}

export function AiSummary({ kpiData, isLoading }: AiSummaryProps) {
  const [summary, setSummary] = useState<GenerateDistrictPerformanceSummaryOutput>(initialSummaryState);
  const [isPending, startTransition] = useTransition();
  const [errorState, setErrorState] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleGenerateSummary = useCallback(() => {
    if (!kpiData || kpiData.every(d => d.value === 0)) {
        setErrorState(t('Not enough data to generate an insight. Please select a different date range or district.'));
        setSummary(initialSummaryState);
        return;
    }
    
    startTransition(async () => {
      setErrorState(null);
      try {
        const result = await generateDistrictPerformanceSummary({ kpiData });
        setSummary(result);
      } catch (error) {
        console.error('Error generating AI summary:', error);
        setErrorState(t('Could not generate an AI insight at this time.'));
        setSummary(initialSummaryState);
      }
    });
  }, [kpiData, t]);

  useEffect(() => {
    // Generate summary when data is loaded and available
    if (!isLoading && kpiData && kpiData.length > 0) {
      handleGenerateSummary();
    }
  }, [isLoading, kpiData, handleGenerateSummary]);

  const renderContent = () => {
    if (isPending || isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="pt-2">
            <Skeleton className="h-6 w-1/3 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="pt-2">
            <Skeleton className="h-6 w-1/3 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      );
    }

    if (errorState) {
        return <p className="text-sm text-destructive">{errorState}</p>;
    }
    
    return (
        <div className="space-y-4">
            <p className="text-sm text-foreground/80">{summary.summary}</p>
            {summary.achievements && summary.achievements.length > 0 && (
                <div>
                    <h4 className="font-semibold text-md mb-2 flex items-center gap-2 text-green-600"><CheckCircle size={18} /> Achievements</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80">
                        {summary.achievements.map((item, index) => <li key={`ach-${index}`}>{item}</li>)}
                    </ul>
                </div>
            )}
            {summary.improvements && summary.improvements.length > 0 && (
                <div>
                    <h4 className="font-semibold text-md mb-2 flex items-center gap-2 text-amber-600"><AlertCircle size={18} /> Areas for Improvement</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80">
                        {summary.improvements.map((item, index) => <li key={`imp-${index}`}>{item}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
  }


  return (
    <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20 rounded-xl shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg text-primary/90 dark:text-primary-foreground/90">{t('AI Insight Summary')}</CardTitle>
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
        {renderContent()}
      </CardContent>
    </Card>
  );
}
