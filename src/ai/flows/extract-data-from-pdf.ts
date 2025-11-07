'use server';
/**
 * @fileOverview An AI flow to extract tabular data from a PDF file.
 *
 * - extractDataFromPdf - A function that handles the PDF data extraction process.
 * - ExtractDataFromPdfInput - The input type for the extractDataFromPdf function.
 * - ExtractDataFromPdfOutput - The return type for the extractDataFromPdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ExtractDataFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file represented as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractDataFromPdfInput = z.infer<typeof ExtractDataFromPdfInputSchema>;

const PerformanceRecordSchema = z.object({
    District: z.string().describe("The name of the police district, e.g., 'Ganjam', 'Cuttack'."),
    Category: z.string().describe("The performance category, e.g., 'NBW', 'Conviction', 'Narcotics', 'Missing Person'."),
    Value: z.number().describe("The numerical value of the performance metric."),
    Date: z.string().describe("The date of the record in YYYY-MM-DD format."),
});

export const ExtractDataFromPdfOutputSchema = z.object({
  data: z.array(PerformanceRecordSchema).describe('An array of performance records extracted from the PDF.'),
});
export type ExtractDataFromPdfOutput = z.infer<typeof ExtractDataFromPdfOutputSchema>;


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
