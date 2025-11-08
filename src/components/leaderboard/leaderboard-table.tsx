'use client';
import { useMemo } from 'react';
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
import { Crown } from 'lucide-react';
import { districts, categoryLabels } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { useCollection } from '@/hooks/use-collection';
import { collection, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase/client';
import { Category } from '@/lib/types';
import { useTranslation } from '@/context/translation-context';

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
    

    return (
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
                            <TableHead className="text-right">{t('Overall Score')}</TableHead>
                            {translatedCategories.map(cat => (
                                <TableHead key={cat.key} className="text-right">{cat.label}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                    {translatedCategories.map(cat => <TableCell key={cat.key}><Skeleton className="h-5 w-16 ml-auto" /></TableCell>)}
                                </TableRow>
                            ))
                        ) : (
                            leaderboardData.map((item, index) => (
                                <TableRow key={item.id} className={cn(index === 0 && 'bg-amber-100/50 dark:bg-amber-900/20 hover:bg-amber-100/70 dark:hover:bg-amber-900/30')}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {index === 0 && <Crown className="h-5 w-5 text-amber-500" />}
                                            <span className="font-medium text-lg">{index + 1}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right font-bold text-primary">{item.score.toLocaleString()}</TableCell>
                                    {translatedCategories.map(cat => (
                                        <TableCell key={cat.key} className="text-right">{item[cat.label]}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
