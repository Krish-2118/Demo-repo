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

const GenerateDistrictPerformanceSummaryInputSchema = z.object({
  districtName: z.string().describe('The name of the district.'),
  category: z.string().describe('The category of performance (e.g., NBW, Conviction, Narcotics, Missing Person).'),
  value: z.number().describe('The performance value for the district and category.'),
  date: z.string().describe('The date for the performance data (YYYY-MM).'),
  improvementPercentage: z.number().optional().describe('The percentage of improvement from the last month, if available.'),
});
export type GenerateDistrictPerformanceSummaryInput = z.infer<typeof GenerateDistrictPerformanceSummaryInputSchema>;

const GenerateDistrictPerformanceSummaryOutputSchema = z.object({
  summary: z.string().describe('A readable sentence summarizing the district performance insight.'),
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

  Generate a concise, readable sentence summarizing the performance of a police district.
  Include the district name, category, performance value, date, and any available improvement percentage.

  District Name: {{{districtName}}}
  Category: {{{category}}}
  Value: {{{value}}}
  Date: {{{date}}}
  {{#if improvementPercentage}}
  Improvement: {{{improvementPercentage}}}%
  {{/if}}

  Summary:`,
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
