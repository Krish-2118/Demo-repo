import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/context/translation-context';

interface DataPreviewProps {
    data: any[];
}

export function DataPreview({ data }: DataPreviewProps) {
    const { t } = useTranslation();
    if (data.length === 0) {
        return (
             <Card className="rounded-xl shadow-lg mt-6">
                <CardHeader>
                    <CardTitle>{t('Data Preview')}</CardTitle>
                    <CardDescription>{t('A preview of the first few rows from your uploaded file will appear here once processed.')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-8">
                        {t('No data processed yet. Upload a file to see the preview.')}
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    const headers = Object.keys(data[0] || {});

    return (
        <Card className="rounded-xl shadow-lg mt-6">
            <CardHeader>
                <CardTitle>{t('Data Preview')}</CardTitle>
                <CardDescription>{t('A preview of the first 5 rows from your processed file. Please verify before saving.')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map(header => <TableHead key={header}>{t(header)}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.slice(0, 5).map((row, index) => (
                            <TableRow key={index}>
                                {headers.map(header => (
                                    <TableCell key={header}>
                                        {typeof row[header] === 'object' ? JSON.stringify(row[header]) : row[header]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
