'use client';
import { useEffect, useState, useTransition, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateDistrictPerformanceSummary, type GenerateDistrictPerformanceSummaryOutput } from '@/ai/flows/generate-district-performance-summary';
import { textToSpeech } from '@/ai/flows/translate-text';
import { Lightbulb, RefreshCw, CheckCircle, AlertCircle, Volume2, Loader2, PlayCircle, PauseCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/translation-context';
import type { PerformanceMetric } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AiSummaryProps {
  districtPerformance: PerformanceMetric[];
  isLoading: boolean;
}

const initialSummaryState: GenerateDistrictPerformanceSummaryOutput = {
    summary: '',
    achievements: [],
    improvements: [],
}

type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export function AiSummary({ districtPerformance, isLoading }: AiSummaryProps) {
  const [summary, setSummary] = useState<GenerateDistrictPerformanceSummaryOutput>(initialSummaryState);
  const [isGeneratingSummary, startGeneratingSummary] = useTransition();
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const [errorState, setErrorState] = useState<string | null>(null);
  const { t, language } = useTranslation();
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateSummary = useCallback(() => {
    startGeneratingSummary(async () => {
      setErrorState(null);
      setAudioUrl(null); 
      setAudioState('idle');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const hasData = districtPerformance && districtPerformance.length > 0 && districtPerformance.some(d => d.casesRegistered > 0 || d.casesSolved > 0);
      if (!hasData) {
          setSummary(initialSummaryState);
          setHasGenerated(true); 
          return;
      }

      try {
        const result = await generateDistrictPerformanceSummary({ districtPerformance, language });
        setSummary(result);
        setHasGenerated(true);
      } catch (error) {
        console.error('Error generating AI summary:', error);
        setErrorState(t('Could not generate an AI insight at this time.'));
        setSummary(initialSummaryState);
      }
    });
  }, [districtPerformance, t, language]);

  const handleAudioPlayback = useCallback(async () => {
    if (!summary.summary || !hasGenerated) return;

    if (audioState === 'playing' && audioRef.current) {
        audioRef.current.pause();
        setAudioState('paused');
        return;
    }

    if (audioState === 'paused' && audioRef.current) {
        audioRef.current.play();
        setAudioState('playing');
        return;
    }

    // If idle and we have a URL, just play.
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setAudioState('playing');
      return;
    }

    // If idle and no URL, generate it.
    if (audioState === 'idle' || audioState === 'error') {
        setAudioState('loading');
        try {
            const fullTextToSpeak = `${summary.summary}. ${t('Achievements')}: ${summary.achievements.join('. ')}. ${t('Areas for Improvement')}: ${summary.improvements.join('. ')}`;
            const result = await textToSpeech({ text: fullTextToSpeak, language });
            setAudioUrl(result.audioDataUri);
        } catch (error) {
            console.error('Error generating audio:', error);
            toast({
                title: t('Audio Generation Failed'),
                description: t('Could not generate audio for the summary.'),
                variant: 'destructive',
            });
            setAudioState('error');
        }
    }
  }, [summary, audioUrl, language, t, toast, audioState, hasGenerated]);


  useEffect(() => {
    if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setAudioState('playing');
    }
  }, [audioUrl]);

  useEffect(() => {
    if (isLoading) {
        setSummary(initialSummaryState);
        setErrorState(null);
        setHasGenerated(false);
        setAudioUrl(null);
        setAudioState('idle');
         if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    } else if (!isGeneratingSummary) {
       // Auto-generate summary when not loading and not already generating
       // handleGenerateSummary(); //This causes too many requests. User must click refresh.
    }
  }, [isLoading, isGeneratingSummary]);
  
  const isPending = isGeneratingSummary || isLoading;

  const renderContent = () => {
    if (isGeneratingSummary) {
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

    const hasData = districtPerformance && districtPerformance.length > 0 && districtPerformance.some(d => d.casesRegistered > 0 || d.casesSolved > 0);

    if (!hasGenerated && !isLoading) {
        return <p className="text-sm text-muted-foreground">{t('Click the refresh button to generate an AI insight for the current data.')}</p>
    }
    
    if (!summary.summary && hasGenerated && hasData) {
        return <p className="text-sm text-muted-foreground">{t('The AI did not return a summary for the current data.')}</p>
    }

    if (!hasData && hasGenerated) {
        return <p className="text-sm text-destructive">{t('Not enough data to generate an insight. Please select a different date range or district.')}</p>;
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-foreground/80">{summary.summary}</p>
            {summary.achievements && summary.achievements.length > 0 && (
                <div>
                    <h4 className="font-semibold text-md mb-2 flex items-center gap-2 text-green-600"><CheckCircle size={18} /> {t('Achievements')}</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80">
                        {summary.achievements.map((item, index) => <li key={`ach-${index}`}>{item}</li>)}
                    </ul>
                </div>
            )}
            {summary.improvements && summary.improvements.length > 0 && (
                <div>
                    <h4 className="font-semibold text-md mb-2 flex items-center gap-2 text-amber-600"><AlertCircle size={18} /> {t('Areas for Improvement')}</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80">
                        {summary.improvements.map((item, index) => <li key={`imp-${index}`}>{item}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
  }

  const renderAudioIcon = () => {
    switch (audioState) {
        case 'loading':
            return <Loader2 className="h-4 w-4 animate-spin" />;
        case 'playing':
            return <PauseCircle className="h-4 w-4" />;
        case 'paused':
            return <PlayCircle className="h-4 w-4" />;
        case 'error':
            return <Volume2 className="h-4 w-4 text-destructive" />;
        default:
            return <Volume2 className="h-4 w-4" />;
    }
  }


  return (
    <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20 rounded-xl shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg text-primary/90 dark:text-primary-foreground/90">{t('AI Insight Summary')}</CardTitle>
        </div>
        <div className='flex items-center gap-2'>
            {summary.summary && hasGenerated && !isGeneratingSummary && (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAudioPlayback}
                    disabled={audioState === 'loading'}
                >
                    {renderAudioIcon()}
                </Button>
            )}
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
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
      <audio 
        ref={audioRef} 
        onEnded={() => setAudioState('idle')} 
        onPause={() => { if (audioState === 'playing') setAudioState('paused'); }}
        onPlay={() => setAudioState('playing')}
        hidden 
       />
    </Card>
  );
}
