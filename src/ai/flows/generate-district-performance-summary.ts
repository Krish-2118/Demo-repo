'use server';
/**
 * @fileOverview AI flow to generate a summary of district performance insights.
 *
 * - generateDistrictPerformanceSummary - A function that generates the district performance summary.
 * - GenerateDistrictPerformanceSummaryInput - The input type for the generateDistrictPerformance-summary function.
 * - GenerateDistrictPerformanceSummaryOutput - The return type for the generateDistrictPerformance-summary function.
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
  summary: z.string().describe('A brief, executive-level summary analyzing the provided performance data. The summary should be a single paragraph, highlighting only the most significant data points, achievements, and areas needing attention.'),
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
  prompt: `You are an expert data analyst. Your task is to provide a clean, short, and precise summary of the following police performance data.

  Focus on the most important takeaways. Generate a single paragraph that includes:
  1.  A brief overall assessment.
  2.  The most significant positive result (e.g., largest increase or highest value).
  3.  The most significant area for improvement (e.g., largest decrease or lowest value).

  Keep the language direct and data-driven.

  KPI Data:
  {{#each kpiData}}
  - **{{{label}}}**: Current value is {{{value}}}. This is a change of {{{change}}}% from last month.
  {{/each}}

  Based on this data, provide a concise, one-paragraph summary.
  `,
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
