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
  summary: z.string().describe('A detailed, multi-paragraph report analyzing the provided performance data. The report should be well-structured, insightful, and use markdown for formatting. It should include an overall summary, highlight key achievements, and identify areas needing attention.'),
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
  prompt: `You are an expert data analyst specializing in law enforcement performance, tasked with generating a detailed performance report.

  Analyze the following Key Performance Indicator (KPI) data and generate a comprehensive, insightful, and well-structured report in markdown format.

  Your report should include the following sections:
  ### Overall Performance Summary
  Start with a high-level summary of the overall performance trends based on the data.

  ### Key Achievements
  Identify and elaborate on the most significant positive results. This could be categories with high absolute values, substantial positive percentage changes, or successful crackdowns. Use the data to support your points.

  ### Areas for Improvement
  Identify and discuss areas that may require more attention. This could be categories with low values or significant negative changes. Offer neutral, data-driven observations.

  ### Detailed Insights
  Provide a brief analysis for each category, commenting on the current value and the change from the previous month.

  KPI Data:
  {{#each kpiData}}
  - **{{{label}}}**: Current value is {{{value}}}. This is a change of {{{change}}}% from last month.
  {{/each}}

  Based on this data, provide a detailed and structured performance report.
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
