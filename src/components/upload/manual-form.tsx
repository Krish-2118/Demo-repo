'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { districts, categoryLabels } from '@/lib/data';
import type { Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useFirestore } from '@/firebase/client';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useTranslation } from '@/context/translation-context';

const formSchema = z.object({
  district: z.string().min(1, 'Please select a district.'),
  category: z.string().min(1, 'Please select a category.'),
  value: z.coerce.number().min(0, 'Value must be a positive number.'),
  date: z.date({
    required_error: 'A date is required.',
  }),
});

export function ManualForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      district: '',
      category: '',
      value: 0,
      date: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({ title: t('Error'), description: t('Firestore not initialized.'), variant: 'destructive' });
        return;
    }

    startTransition(async () => {
      try {
        const record = {
            districtId: parseInt(values.district),
            category: values.category,
            value: values.value,
            date: Timestamp.fromDate(values.date),
        };

        await addDoc(collection(firestore, 'records'), record);

        toast({
            title: t('Record Saved'),
            description: t('The performance record has been saved successfully.'),
        });
        form.reset();
        form.setValue('date', new Date()); // Reset date to today
        
      } catch (error) {
        toast({
          title: t('Save Failed'),
          description:
            (error as Error).message || t('An unexpected error occurred.'),
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <Card className="rounded-xl shadow-lg mt-6">
      <CardHeader>
        <CardTitle>{t('Manual Data Entry')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('District')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={t('Select a district')} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {districts.map(d => (
                            <SelectItem key={d.id} value={d.id.toString()}>
                                {t(d.name)}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('Category')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={t('Select a category')} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {(Object.keys(categoryLabels) as Category[]).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {t(categoryLabels[cat])}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('Value')}</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder={t("Enter performance value")} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                    <FormLabel>{t('Date')}</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={'outline'}
                            className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                            )}
                            >
                            {field.value ? (
                                format(field.value, 'PPP')
                            ) : (
                                <span>{t('Pick a date')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <Button type="submit" disabled={isPending}>
                {isPending ? t('Saving...') : t('Save Record')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
