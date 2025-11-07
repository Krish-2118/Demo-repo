import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const previewData = [
    { district: 'Ganjam', category: 'NBW', value: '120', date: '2023-05-15' },
    { district: 'Cuttack', category: 'Conviction', value: '55', date: '2023-05-20' },
    { district: 'Bhubaneswar', category: 'Narcotics', value: '22', date: '2023-05-10' },
    { district: 'Puri', category: 'Missing Person', value: '18', date: '2023-05-05' },
];

export function DataPreview() {
    return (
        <Card className="rounded-xl shadow-lg mt-6">
            <CardHeader>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>A preview of the first few rows from your uploaded file will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>District</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {previewData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.district}</TableCell>
                                <TableCell>{row.category}</TableCell>
                                <TableCell>{row.value}</TableCell>
                                <TableCell>{row.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
