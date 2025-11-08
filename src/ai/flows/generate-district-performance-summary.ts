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
import { type PerformanceMetric } from '@/lib/types';

const DistrictPerformanceSchema = z.object({
  category: z.string(),
  label: z.string(),
  casesRegistered: z.number(),
  casesSolved: z.number(),
  solveRate: z.number(),
  previousSolveRate: z.number(),
});


const GenerateDistrictPerformanceSummaryInputSchema = z.object({
  districtPerformance: z.array(DistrictPerformanceSchema).describe('An array of performance data for all categories for a specific district or all districts combined.'),
  language: z.enum(['en', 'or']).default('en').describe("The language for the AI-generated output. 'en' for English, 'or' for Odia."),
});
export type GenerateDistrictPerformanceSummaryInput = z.infer<typeof GenerateDistrictPerformanceSummaryInputSchema>;

const GenerateDistrictPerformanceSummaryOutputSchema = z.object({
  summary: z.string().describe('A brief, executive-level summary analyzing the provided performance data, highlighting the most significant trends across all categories.'),
  achievements: z.array(z.string()).describe('A list of key achievements, highlighting specific categories that are excelling.'),
  improvements: z.array(z.string()).describe('A list of areas that need the most improvement, pointing out specific categories that are underperforming.'),
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
  prompt: `You are an expert data analyst for a police department. Your task is to provide a clear, structured, and insightful analysis of the following performance data. The data represents either a single district's performance or an aggregation of all districts.

  Your analysis should focus on the 'solveRate' and its change compared to the 'previousSolveRate'.

  IMPORTANT: Generate the entire output in the requested language: {{{language}}}. 'en' is for English, and 'or' is for Odia.

  Generate a report with three sections:
  1.  **summary**: A brief, one-paragraph overview of the overall performance. Mention the overall trend in solve rates.
  2.  **achievements**: A bulleted list of the top 2-3 categories with the highest 'solveRate' or the most significant positive improvement from 'previousSolveRate'. Mention specific categories by name and their achievements (e.g., "Firearms Seized saw a 20% improvement in solve rate, reaching 95%.").
  3.  **improvements**: A bulleted list of the top 2-3 categories with the lowest 'solveRate' or the most significant negative change. Mention specific categories and their weak points (e.g., "Cybercrime solve rate is the lowest at 15%, requiring urgent attention.").


  Performance Data:
  {{#each districtPerformance}}
  - **Category: {{{label}}}**
    - Cases Registered: {{{casesRegistered}}}
    - Cases Solved: {{{casesSolved}}}
    - Current Solve Rate: {{{solveRate}}}%
    - Previous Month's Solve Rate: {{{previousSolveRate}}}%
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
