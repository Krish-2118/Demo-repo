'use server';
/**
 * @fileOverview An AI flow to extract tabular data from a PDF file.
 *
 * - extractDataFromPdf - A function that handles the PDF data extraction process.
 */

import { ai } from '@/ai/genkit';
import {
  ExtractDataFromPdfInputSchema,
  ExtractDataOutputSchema,
  type ExtractDataFromPdfInput,
  type ExtractDataOutput
} from '@/lib/types';
import { categoryLabels } from '@/lib/data';


export async function extractDataFromPdf(input: ExtractDataFromPdfInput): Promise<ExtractDataOutput> {
  return extractDataFromPdfFlow(input);
}

const allCategories = Object.values(categoryLabels).join(', ');

const prompt = ai.definePrompt({
    name: 'extractDataFromPdfPrompt',
    input: { schema: ExtractDataFromPdfInputSchema },
    output: { schema: ExtractDataOutputSchema },
    prompt: `You are an expert data extraction agent. Your task is to analyze the provided PDF file and extract any tabular data that represents police performance records.

    The table can have columns like 'District', 'Category', 'Cases Registered', 'Cases Solved', and 'Date', but the column names might vary. You must intelligently map the columns to the required output schema.

    - The 'District' should be a district name.
    - The 'Category' must be one of the following: ${allCategories}.
    - The 'Cases Registered' should be a number.
    - The 'Cases Solved' should be a number.
    - The 'Date' should be formatted as YYYY-MM-DD.

    Carefully examine the document and extract all relevant rows into a structured JSON array.

    PDF Document: {{media url=pdfDataUri}}`,
});


const extractDataFromPdfFlow = ai.defineFlow(
  {
    name: 'extractDataFromPdfFlow',
    inputSchema: ExtractDataFromPdfInputSchema,
    outputSchema: ExtractDataOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
