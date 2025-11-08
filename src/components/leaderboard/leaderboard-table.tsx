'use client';
import { useMemo, useState, useEffect } from 'react';
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
import { districts } from '@/lib/data';
import type { Record as PerformanceRecord } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const generateMockData = (): PerformanceRecord[] => {
    const data: PerformanceRecord[] = [];
    let idCounter = 0;
    for (const district of districts) {
        for (const category of ['NBW', 'Conviction', 'Narcotics', 'Missing Person']) {
             data.push({
                id: (idCounter++).toString(),
                districtId: district.id,
                category: category as any,
                value: Math.floor(Math.random() * 100) + 1,
                date: new Date(),
            });
        }
    }
    return data;
}

export function LeaderboardTable() {
    const [records, setRecords] = useState<PerformanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setRecords(generateMockData());
        setIsLoading(false);
    }, []);

    const leaderboardData = useMemo(() => {
        if (!records) return [];

        const districtScores = new Map<number, { id: number; name: string; score: number; nbw: number; conviction: number; narcotics: number; missing: number }>();
        
        districts.forEach(district => {
            districtScores.set(district.id, {
                id: district.id,
                name: district.name,
                score: 0,
                nbw: 0,
                conviction: 0,
                narcotics: 0,
                missing: 0,
            });
        });

        records.forEach(record => {
            const districtData = districtScores.get(record.districtId);
            if (districtData) {
                districtData.score += record.value;
                if (record.category === 'NBW') districtData.nbw += record.value;
                if (record.category === 'Conviction') districtData.conviction += record.value;
                if (record.category === 'Narcotics') districtData.narcotics += record.value;
                if (record.category === 'Missing Person') districtData.missing += record.value;
            }
        });

        return Array.from(districtScores.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }, [records]);

    return (
        <Card className="rounded-xl shadow-lg">
            <CardHeader>
                <CardTitle>Top 5 Performing Districts</CardTitle>
                <CardDescription>Based on overall performance score.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Rank</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead className="text-right">Overall Score</TableHead>
                            <TableHead className="text-right">NBW</TableHead>
                            <TableHead className="text-right">Conviction</TableHead>
                            <TableHead className="text-right">Narcotics</TableHead>
                            <TableHead className="text-right">Missing Persons</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
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
                                    <TableCell className="text-right">{item.nbw}</TableCell>
                                    <TableCell className="text-right">{item.conviction}</TableCell>
                                    <TableCell className="text-right">{item.narcotics}</TableCell>
                                    <TableCell className="text-right">{item.missing}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
