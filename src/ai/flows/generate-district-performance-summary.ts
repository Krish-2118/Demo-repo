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

const DistrictPerformanceSchema = z.object({
  name: z.string().describe('The name of the district.'),
  'Cases Registered': z.number(),
  'Cases Solved': z.number(),
  'Total Convictions': z.number(),
  'Heinous Crime Cases': z.number(),
  'Property Crime Cases': z.number(),
  'NBW Execution': z.number(),
  'Conviction Ratio': z.number(),
  'Narcotic Seizures': z.number(),
  'Missing Persons Traced': z.number(),
  'Firearms Seized': z.number(),
  'Illegal Sand Mining Cases': z.number(),
  'Preventive Actions Taken': z.number(),
  'Important Detections': z.number(),
  'Crime Against Women': z.number(),
  'Cybercrime': z.number(),
  'Road Accidents': z.number(),
  'Others': z.number(),
}).catchall(z.number());


const GenerateDistrictPerformanceSummaryInputSchema = z.object({
  districtPerformance: z.array(DistrictPerformanceSchema).describe('An array of performance data for all districts.'),
});
export type GenerateDistrictPerformanceSummaryInput = z.infer<typeof GenerateDistrictPerformanceSummaryInputSchema>;

const GenerateDistrictPerformanceSummaryOutputSchema = z.object({
  summary: z.string().describe('A brief, executive-level summary analyzing the provided performance data, highlighting the most significant trends across all districts.'),
  achievements: z.array(z.string()).describe('A list of key achievements, highlighting specific districts that are excelling in certain categories.'),
  improvements: z.array(z.string()).describe('A list of areas that need the most improvement, pointing out specific districts that are underperforming.'),
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
  prompt: `You are an expert data analyst for a police department. Your task is to provide a clear, structured, and insightful analysis of the following district-level performance data.

  Your analysis should focus on comparative insights and location-based trends.

  Generate a report with three sections:
  1.  **summary**: A brief, one-paragraph overview of the overall performance, comparing the performance of different districts.
  2.  **achievements**: A bulleted list of the top 2-3 most significant positive results. Mention specific districts by name and their achievements (e.g., "Ganjam district excelled in Narcotic Seizures with the highest value of X").
  3.  **improvements**: A bulleted list of the top 2-3 most significant areas for improvement. Mention specific districts by name and their weak points (e.g., "Cuttack district needs to improve its Conviction Ratio, which is the lowest at Y").


  District Performance Data:
  {{#each districtPerformance}}
  - **District: {{{name}}}**
    - Cases Registered: {{{json this.['Cases Registered']}}}
    - Cases Solved: {{{json this.['Cases Solved']}}}
    - Total Convictions: {{{json this.['Total Convictions']}}}
    - Heinous Crime Cases: {{{json this.['Heinous Crime Cases']}}}
    - Property Crime Cases: {{{json this.['Property Crime Cases']}}}
    - NBW Execution: {{{json this.['NBW Execution']}}}
    - Conviction Ratio: {{{json this.['Conviction Ratio']}}}
    - Narcotic Seizures: {{{json this.['Narcotic Seizures']}}}
    - Missing Persons Traced: {{{json this.['Missing Persons Traced']}}}
    - Firearms Seized: {{{json this.['Firearms Seized']}}}
    - Illegal Sand Mining Cases: {{{json this.['Illegal Sand Mining Cases']}}}
    - Preventive Actions Taken: {{{json this.['Preventive Actions Taken']}}}
    - Important Detections: {{{json this.['Important Detections']}}}
    - Crime Against Women: {{{json this.['Crime Against Women']}}}
    - Cybercrime: {{{json this.Cybercrime}}}
    - Road Accidents: {{{json this.['Road Accidents']}}}
    - Others: {{{json this.Others}}}
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
