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
import { districts, categoryLabels } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { useCollection } from '@/hooks/use-collection';
import { collection, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase/client';
import { Category } from '@/lib/types';
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

type ScoreData = {
    id: number;
    name: string;
    score: number;
} & Record<string, number>;


export function LeaderboardTable() {
    const firestore = useFirestore();
    const recordsQuery = useMemo(() => firestore ? query(collection(firestore, "records")) : null, [firestore]);
    const { data: records, loading: isLoading } = useCollection(recordsQuery);
    const { t } = useTranslation();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState<ScoreData | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isGenerating, startGenerating] = useTransition();

    const translatedCategories = useMemo(() => {
        const cats = Object.keys(categoryLabels) as Category[];
        return cats.map(cat => ({
            key: cat,
            label: t(categoryLabels[cat])
        }));
    }, [t]);

    const leaderboardData: ScoreData[] = useMemo(() => {
        if (!records) return [];

        const districtScores = new Map<number, ScoreData>();
        
        districts.forEach(district => {
            const initialScores: Record<string, number> = {};
            translatedCategories.forEach(cat => {
                initialScores[cat.label] = 0;
            });

            districtScores.set(district.id, {
                id: district.id,
                name: t(district.name),
                score: 0,
                ...initialScores
            });
        });

        records.forEach(record => {
            const districtData = districtScores.get(record.districtId);
            if (districtData) {
                districtData.score += record.value;
                const categoryLabel = t(categoryLabels[record.category as Category]);
                if (categoryLabel in districtData) {
                    districtData[categoryLabel] += record.value;
                }
            }
        });

        return Array.from(districtScores.values())
            .sort((a, b) => b.score - a.score)
    }, [records, t, translatedCategories]);

    const handleGetSuggestions = (districtData: ScoreData) => {
        setSelectedDistrict(districtData);
        setIsDialogOpen(true);
        setSuggestions([]); // Clear previous suggestions

        startGenerating(async () => {
            try {
                // Find the 3 worst-performing categories
                const performanceData = translatedCategories
                    .map(cat => ({ category: cat.label, value: districtData[cat.label] }))
                    .sort((a, b) => a.value - b.value)
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
                <CardDescription>{t('Based on overall performance score from live data across all categories.')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">{t('Rank')}</TableHead>
                            <TableHead>{t('District')}</TableHead>
                            {translatedCategories.map(cat => (
                                <TableHead key={cat.key} className="text-right">{cat.label}</TableHead>
                            ))}
                            <TableHead className="text-right font-bold">{t('Overall Score')}</TableHead>
                            <TableHead className="text-center">{t('Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    {translatedCategories.map(cat => <TableCell key={cat.key}><Skeleton className="h-5 w-16 ml-auto" /></TableCell>)}
                                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-24 mx-auto" /></TableCell>
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
                                    {translatedCategories.map(cat => (
                                        <TableCell key={cat.key} className="text-right">{item[cat.label].toLocaleString()}</TableCell>
                                    ))}
                                    <TableCell className="text-right font-bold text-primary">{item.score.toLocaleString()}</TableCell>
                                    <TableCell className="text-center">
                                        {index > 2 && (
                                            <Button variant="outline" size="sm" onClick={() => handleGetSuggestions(item)} disabled={isGenerating && selectedDistrict?.id === item.id}>
                                                {isGenerating && selectedDistrict?.id === item.id ? 
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                                                    <Lightbulb className="mr-2 h-4 w-4" />
                                                }
                                                {t('Get Suggestions')}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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
                            <span>{t('Generating suggestions...')}</span>
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
