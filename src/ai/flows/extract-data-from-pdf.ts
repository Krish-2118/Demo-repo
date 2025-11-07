'use server';
/**
 * @fileOverview An AI flow to extract tabular data from a PDF file.
 *
 * - extractDataFromPdf - A function that handles the PDF data extraction process.
 */

import { ai } from '@/ai/genkit';
import {
  ExtractDataFromPdfInputSchema,
  ExtractDataFromPdfOutputSchema,
  type ExtractDataFromPdfInput,
  type ExtractDataFromPdfOutput
} from '@/lib/types/pdf-extraction';


export async function extractDataFromPdf(input: ExtractDataFromPdfInput): Promise<ExtractDataFromPdfOutput> {
  return extractDataFromPdfFlow(input);
}


const prompt = ai.definePrompt({
    name: 'extractDataFromPdfPrompt',
    input: { schema: ExtractDataFromPdfInputSchema },
    output: { schema: ExtractDataFromPdfOutputSchema },
    prompt: `You are an expert data extraction agent. Your task is to analyze the provided PDF file and extract any tabular data that represents police performance records.

    The table can have columns like 'District', 'Category', 'Value', and 'Date', but the column names might vary. You must intelligently map the columns to the required output schema.

    - The 'District' should be a district name.
    - The 'Category' must be one of the following: 'NBW', 'Conviction', 'Narcotics', 'Missing Person'.
    - The 'Value' should be a number.
    - The 'Date' should be formatted as YYYY-MM-DD.

    Carefully examine the document and extract all relevant rows into a structured JSON array.

    PDF Document: {{media url=pdfDataUri}}`,
});


const extractDataFromPdfFlow = ai.defineFlow(
  {
    name: 'extractDataFromPdfFlow',
    inputSchema: ExtractDataFromPdfInputSchema,
    outputSchema: ExtractDataFromPdfOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
