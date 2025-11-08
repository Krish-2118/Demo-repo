'use server';
/**
 * @fileOverview AI flow to generate a summary of district performance insights.
 *
 * - generateDistrictPerformanceSummary - A function that generates the district performance summary.
 * - GenerateDistrictPerformanceSummaryInput - The input type for the generateDistrictPerformanceSummary function.
 * - GenerateDistrictPerformanceSummaryOutput - The return type for the generateDistrictPerformanceSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KpiMetricSchema = z.object({
  category: z.string(),
  label: z.string(),
  value: z.number(),
  change: z.number(),
});

const GenerateDistrictPerformanceSummaryInputSchema = z.object({
  kpiData: z.array(KpiMetricSchema).describe('An array of Key Performance Indicator metrics for various categories.'),
});
export type GenerateDistrictPerformanceSummaryInput = z.infer<typeof GenerateDistrictPerformanceSummaryInputSchema>;

const GenerateDistrictPerformanceSummaryOutputSchema = z.object({
  summary: z.string().describe('A readable sentence summarizing the overall performance based on the provided KPIs. Highlight the most significant metric (highest value or biggest change).'),
});
export type GenerateDistrictPerformanceSummaryOutput = z.infer<typeof GenerateDistrictPerformanceSummaryOutputSchema>;

export async function generateDistrictPerformanceSummary(
  input: GenerateDistrictPerformanceSummaryInput
): Promise<GenerateDistrictPerformanceSummaryOutput> {
  return generateDistrictPerformanceSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDistrictPerformanceSummaryPrompt',
  input: {schema: GenerateDistrictPerformanceSummaryInputSchema},
  output: {schema: GenerateDistrictPerformanceSummaryOutputSchema},
  prompt: `You are an expert data analyst specializing in law enforcement performance.

  Generate a concise, readable, and insightful sentence summarizing the overall performance based on the provided Key Performance Indicators (KPIs).

  Your summary should:
  1. Briefly mention the overall trend.
  2. Highlight the most notable metric. This could be the category with the highest value, the most significant positive change, or the most concerning negative change.
  3. Be insightful and sound like a professional analyst.

  KPI Data:
  {{#each kpiData}}
  - Category: {{{label}}}, Value: {{{value}}}, Change from last month: {{{change}}}%
  {{/each}}

  Based on this data, provide a single, compelling summary sentence.`,
});

const generateDistrictPerformanceSummaryFlow = ai.defineFlow(
  {
    name: 'generateDistrictPerformanceSummaryFlow',
    inputSchema: GenerateDistrictPerformanceSummaryInputSchema,
    outputSchema: GenerateDistrictPerformanceSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
