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
  summary: z.string().describe('A brief, executive-level summary analyzing the provided performance data, highlighting the most significant trends.'),
  achievements: z.array(z.string()).describe('A list of key achievements or strongest areas of performance.'),
  improvements: z.array(z.string()).describe('A list of areas that need the most improvement.'),
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
  prompt: `You are an expert data analyst for a police department. Your task is to provide a clear, structured, and insightful analysis of the following performance data.

  Generate a report with three sections:
  1.  **summary**: A brief, one-paragraph overview of the overall performance.
  2.  **achievements**: A bulleted list of the top 2-3 most significant positive results (e.g., largest percentage increase in a positive category or highest values). Be specific and use the data.
  3.  **improvements**: A bulleted list of the top 2-3 most significant areas for improvement (e.g., largest decrease or underperforming categories). Be specific and use the data.


  KPI Data:
  {{#each kpiData}}
  - **{{{label}}}**: Current value is {{{value}}}. This is a change of {{{change}}}% from last month.
  {{/each}}
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
