'use server';
/**
 * @fileOverview An AI flow to extract structured performance data from unstructured text.
 *
 * - extractAndStructureData - A function that handles the data extraction and structuring process.
 */

import { ai } from '@/ai/genkit';
import {
  ExtractAndStructureDataInputSchema,
  ExtractAndStructureDataOutputSchema,
  type ExtractAndStructureDataInput,
  type ExtractAndStructureDataOutput,
} from '@/lib/types';
import { categoryLabels } from '@/lib/data';

export async function extractAndStructureData(
  input: ExtractAndStructureDataInput
): Promise<ExtractAndStructureDataOutput> {
  return extractAndStructureDataFlow(input);
}

const allCategories = Object.keys(categoryLabels).join(', ');

const prompt = ai.definePrompt({
  name: 'extractAndStructureDataPrompt',
  input: { schema: ExtractAndStructureDataInputSchema },
  output: { schema: ExtractAndStructureDataOutputSchema },
  prompt: `You are an expert data extraction agent for a police department. Your task is to analyze the provided unstructured text and convert it into a structured JSON array of performance records.

    The text can be informal, like daily reports, emails, or notes. You must intelligently identify and extract the following information for each record:
    - District: The name of the police district.
    - Category: The performance category. It MUST be one of these values: ${allCategories}. If a category doesn't fit into any of the specific categories, classify it as 'Others'.
    - Value: The numerical value or count for the metric.
    - Date: The date of the record. If the date is not specified for a record, try to infer it from surrounding context (e.g., a date mentioned at the beginning of the report). If no date can be found, use today's date. Format the date as YYYY-MM-DD.

    Carefully examine the entire text and extract all relevant records. If the text mentions multiple records, create a separate JSON object for each one.

    Unstructured Text Input:
    {{{textInput}}}
    `,
});

const extractAndStructureDataFlow = ai.defineFlow(
  {
    name: 'extractAndStructureDataFlow',
    inputSchema: ExtractAndStructureDataInputSchema,
    outputSchema: ExtractAndStructureDataOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
