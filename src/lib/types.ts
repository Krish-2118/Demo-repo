import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export type District = {
  id: number;
  name: string;
};

export type Category =
  | 'NBW'
  | 'Conviction'
  | 'Narcotics'
  | 'Missing Person'
  | 'Firearms'
  | 'Sand Mining'
  | 'Preventive Actions'
  | 'Important Detections'
  | 'Property Crime Cases'
  | 'Crime Against Women'
  | 'Cybercrime'
  | 'Others';

export type Record = {
  id: string;
  districtId: number;
  category: Category;
  casesRegistered: number;
  casesSolved: number;
  date: Date | Timestamp;
};

export type PerformanceMetric = {
  category: Category;
  label: string;
  casesRegistered: number;
  casesSolved: number;
  solveRate: number;
  previousSolveRate: number;
};

// PDF & Text Extraction Types
const PerformanceRecordSchema = z.object({
  District: z
    .string()
    .describe(
      "The name of the police district, e.g., 'Ganjam', 'Cuttack'."
    ),
  Category: z
    .string()
    .describe(
      "The performance category, e.g., 'NBW', 'Conviction', 'Narcotics', 'Missing Person', 'Firearms', 'Sand Mining', 'Preventive Actions', 'Important Detections', 'Property Crime Cases', 'Crime Against Women', 'Cybercrime', 'Others'."
    ),
  'Cases Registered': z.number().describe('The number of cases registered for that category on a given day.'),
  'Cases Solved': z.number().describe('The number of cases solved for that category on a given day.'),
  Date: z.string().describe('The date of the record in YYYY-MM-DD format.'),
});

export const ExtractDataOutputSchema = z.object({
  data: z
    .array(PerformanceRecordSchema)
    .describe('An array of performance records extracted from the document or text.'),
});
export type ExtractDataOutput = z.infer<typeof ExtractDataOutputSchema>;


// PDF Input
export const ExtractDataFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file represented as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractDataFromPdfInput = z.infer<
  typeof ExtractDataFromPdfInputSchema
>;


// Text Input
export const ExtractAndStructureDataInputSchema = z.object({
  textInput: z.string().describe('Unstructured text containing performance data.'),
});
export type ExtractAndStructureDataInput = z.infer<typeof ExtractAndStructureDataInputSchema>;


// Improvement Suggestions Types
const DistrictPerformanceDataSchema = z.object({
  category: z.string().describe('The performance category label.'),
  solveRate: z.number().describe('The solve rate (from 0 to 100) for that category.'),
  casesRegistered: z.number().describe('The number of cases registered for that category.'),
  casesSolved: z.number().describe('The number of cases solved for that category.')
});

export const GenerateImprovementSuggestionsInputSchema = z.object({
  districtName: z
    .string()
    .describe('The name of the district needing suggestions.'),
  performanceData: z
    .array(DistrictPerformanceDataSchema)
    .describe(
      'An array of performance metrics for the district, focusing on the lowest-performing areas.'
    ),
});
export type GenerateImprovementSuggestionsInput = z.infer<
  typeof GenerateImprovementSuggestionsInputSchema
>;

export const GenerateImprovementSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of actionable suggestions to improve performance.'),
});
export type GenerateImprovementSuggestionsOutput = z.infer<
  typeof GenerateImprovementSuggestionsOutputSchema
>;
