'use server';
/**
 * @fileOverview An AI flow to extract structured performance data from unstructured text.
 *
 * - extractAndStructureData - A function that handles the data extraction and structuring process.
 */

import { ai } from '@/ai/genkit';
import {
  ExtractAndStructureDataInputSchema,
  ExtractDataOutputSchema,
  type ExtractAndStructureDataInput,
  type ExtractDataOutput,
} from '@/lib/types';
import { categoryLabels } from '@/lib/data';

export async function extractAndStructureData(
  input: ExtractAndStructureDataInput
): Promise<ExtractDataOutput> {
  return extractAndStructureDataFlow(input);
}

const allCategories = Object.values(categoryLabels).join(', ');

const prompt = ai.definePrompt({
  name: 'extractAndStructureDataPrompt',
  input: { schema: ExtractAndStructureDataInputSchema },
  output: { schema: ExtractDataOutputSchema },
  prompt: `You are an expert data extraction agent for a police department. Your task is to analyze the provided unstructured text and convert it into a structured JSON array of performance records.

    The text can be informal, like daily reports, emails, or notes. For each entry, you must identify and extract the following information:
    - District: The name of the police district.
    - Category: The performance category. It MUST be one of these values: ${allCategories}.
    - Cases Registered: The number of cases registered for that category.
    - Cases Solved: The number of cases solved for that category.
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
    outputSchema: ExtractDataOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
