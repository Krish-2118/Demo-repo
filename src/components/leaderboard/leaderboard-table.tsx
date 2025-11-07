'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { districts, records } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

export function LeaderboardTable() {
    const leaderboardData = districts.map(district => {
        const districtRecords = records.filter(r => r.districtId === district.id);
        const score = districtRecords.reduce((acc, record) => acc + record.value, 0);
        return {
            id: district.id,
            name: district.name,
            score,
            nbw: districtRecords.find(r => r.category === 'NBW')?.value ?? 0,
            conviction: districtRecords.find(r => r.category === 'Conviction')?.value ?? 0,
            narcotics: districtRecords.find(r => r.category === 'Narcotics')?.value ?? 0,
            missing: districtRecords.find(r => r.category === 'Missing Person')?.value ?? 0,
        };
    }).sort((a, b) => b.score - a.score).slice(0,5);

    return (
        <Card className="rounded-xl shadow-lg">
            <CardHeader>
                <CardTitle>Top 5 Performing Districts</CardTitle>
                <CardDescription>Based on overall performance score for May 2023.</CardDescription>
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
                        {leaderboardData.map((item, index) => (
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
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
