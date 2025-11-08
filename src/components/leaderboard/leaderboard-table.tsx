'use client';
import { useMemo, useState, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Crown, Medal, Gem, Lightbulb, Loader2 } from 'lucide-react';
import { districts } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { useCollection } from '@/hooks/use-collection';
import { collection, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase/client';
import { useTranslation } from '@/context/translation-context';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { generateImprovementSuggestions } from '@/ai/flows/generate-improvement-suggestions';
import { useToast } from '@/hooks/use-toast';
import { categoryLabels } from '@/lib/data';
import { Category } from '@/lib/types';


type ScoreData = {
    id: number;
    name: string;
    totalCasesRegistered: number;
    totalCasesSolved: number;
    solveRate: number;
    overallScore: number;
};


export function LeaderboardTable() {
    const firestore = useFirestore();
    const recordsQuery = useMemo(() => firestore ? query(collection(firestore, "records")) : null, [firestore]);
    const { data: records, loading: isLoading } = useCollection(recordsQuery);
    const { t } = useTranslation();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState<any | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isGenerating, startGenerating] = useTransition();

    const leaderboardData: ScoreData[] = useMemo(() => {
        if (!records) return [];

        const districtScores = new Map<number, { id: number; name: string; totalCasesRegistered: number; totalCasesSolved: number; performance: any }>();
        
        districts.forEach(district => {
            districtScores.set(district.id, {
                id: district.id,
                name: t(district.name),
                totalCasesRegistered: 0,
                totalCasesSolved: 0,
                performance: {}
            });
        });
        
        records.forEach(record => {
            const districtData = districtScores.get(record.districtId);
            if (districtData) {
                districtData.totalCasesRegistered += record.casesRegistered;
                districtData.totalCasesSolved += record.casesSolved;
                
                if (!districtData.performance[record.category]) {
                    districtData.performance[record.category] = { registered: 0, solved: 0 };
                }
                districtData.performance[record.category].registered += record.casesRegistered;
                districtData.performance[record.category].solved += record.casesSolved;
            }
        });
        
        const calculatedData = Array.from(districtScores.values()).map(d => ({
            ...d,
            solveRate: d.totalCasesRegistered > 0 ? (d.totalCasesSolved / d.totalCasesRegistered) * 100 : 0,
            overallScore: d.totalCasesSolved, // Score is based on total cases solved
        }));

        return calculatedData.sort((a, b) => b.overallScore - a.overallScore);

    }, [records, t]);

    const handleGetSuggestions = (districtData: ScoreData & { performance: any }) => {
        setSelectedDistrict(districtData);
        setIsDialogOpen(true);
        setSuggestions([]); // Clear previous suggestions

        startGenerating(async () => {
            try {
                // Find the 3 worst-performing categories based on solve rate
                const performanceData = (Object.keys(categoryLabels) as Category[])
                    .map(cat => {
                        const registered = districtData.performance[cat]?.registered || 0;
                        const solved = districtData.performance[cat]?.solved || 0;
                        const solveRate = registered > 0 ? (solved / registered) * 100 : 0;
                        return { category: t(categoryLabels[cat]), solveRate, casesRegistered: registered, casesSolved: solved };
                    })
                    .sort((a, b) => a.solveRate - b.solveRate)
                    .slice(0, 3);
                
                const result = await generateImprovementSuggestions({
                    districtName: districtData.name,
                    performanceData: performanceData
                });
                if (result.suggestions) {
                    setSuggestions(result.suggestions);
                }
            } catch (error) {
                console.error("Failed to generate suggestions", error);
                toast({
                    title: t("Error"),
                    description: t("Could not generate suggestions at this time."),
                    variant: 'destructive',
                });
                setIsDialogOpen(false);
            }
        });
    }
    
    const getRankIndicator = (index: number) => {
        if (index === 0) return <Crown className="h-5 w-5 text-amber-500" />;
        if (index === 1) return <Medal className="h-5 w-5 text-slate-400" />;
        if (index === 2) return <Gem className="h-5 w-5 text-amber-800" />;
        return null;
    }

    const getRowClass = (index: number) => {
        if (index === 0) return 'bg-amber-100/50 dark:bg-amber-900/20 hover:bg-amber-100/70 dark:hover:bg-amber-900/30';
        if (index === 1) return 'bg-slate-100/50 dark:bg-slate-800/20 hover:bg-slate-100/70 dark:hover:bg-slate-800/30';
        if (index === 2) return 'bg-yellow-800/10 dark:bg-yellow-900/20 hover:bg-yellow-800/20 dark:hover:bg-yellow-900/30';
        return '';
    }

    return (
        <>
        <Card className="rounded-xl shadow-lg">
            <CardHeader>
                <CardTitle>{t('District Leaderboard')}</CardTitle>
                <CardDescription>{t('Based on total cases solved across all categories.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">{t('Rank')}</TableHead>
                            <TableHead>{t('District')}</TableHead>
                            <TableHead className="text-right">{t('Total Cases Registered')}</TableHead>
                            <TableHead className="text-right">{t('Total Cases Solved')}</TableHead>
                            <TableHead className="text-right">{t('Solve Rate')}</TableHead>
                            <TableHead className="text-right">{t('Overall Score')}</TableHead>
                            <TableHead className="text-center">{t('Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                    <TableCell className="text-center"><Skeleton className="h-8 w-24 mx-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            leaderboardData.map((item, index) => (
                                <TableRow key={item.id} className={cn(getRowClass(index))}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getRankIndicator(index)}
                                            <span className="font-medium text-lg">{index + 1}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right">{item.totalCasesRegistered.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{item.totalCasesSolved.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{item.solveRate.toFixed(1)}%</TableCell>
                                    <TableCell className="text-right font-bold text-primary">{item.overallScore.toLocaleString()}</TableCell>
                                    <TableCell className="text-center">
                                        {index > 2 && (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => handleGetSuggestions(item)} 
                                                disabled={isGenerating && selectedDistrict?.id === item.id}
                                            >
                                                {isGenerating && selectedDistrict?.id === item.id ? 
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        {t('Generating...')}
                                                    </>
                                                    :
                                                    <>
                                                        <Lightbulb className="mr-2 h-4 w-4" />
                                                        {t('Get Suggestions')}
                                                    </>
                                                }
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
              </div>
            </CardContent>
        </Card>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('AI Improvement Suggestions for')} {selectedDistrict?.name}</DialogTitle>
                    <DialogDescription>
                        {t('Based on the lowest performing categories, here are some actionable recommendations.')}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {isGenerating ? (
                        <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>{t('Generating...')}</span>
                        </div>
                    ) : (
                        <ul className="space-y-4 list-disc pl-5">
                            {suggestions.map((suggestion, index) => (
                                <li key={index} className="text-sm text-foreground/80">{suggestion}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
