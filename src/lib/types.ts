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
  | 'Crime Against Women'
  | 'Cybercrime'
  | 'Road Accidents'
  | 'Others';

export type Record = {
  id: string;
  districtId: number;
  category: Category;
  value: number;
  date: Date | Timestamp;
};

export type PerformanceMetric = {
  category: Category;
  label: string;
  value: number;
  change: number;
};

// PDF Extraction Types

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

const PerformanceRecordSchema = z.object({
  District: z
    .string()
    .describe(
      "The name of the police district, e.g., 'Ganjam', 'Cuttack'."
    ),
  Category: z
    .string()
    .describe(
      "The performance category, e.g., 'NBW', 'Conviction', 'Narcotics', 'Missing Person', 'Firearms', 'Sand Mining', 'Preventive Actions', 'Important Detections', 'Crime Against Women', 'Cybercrime', 'Road Accidents', 'Others'."
    ),
  Value: z.number().describe('The numerical value of the performance metric.'),
  Date: z.string().describe('The date of the record in YYYY-MM-DD format.'),
});

export const ExtractDataFromPdfOutputSchema = z.object({
  data: z
    .array(PerformanceRecordSchema)
    .describe('An array of performance records extracted from the PDF.'),
});
export type ExtractDataFromPdfOutput = z.infer<
  typeof ExtractDataFromPdfOutputSchema
>;

// Improvement Suggestions Types

const DistrictPerformanceDataSchema = z.object({
  category: z.string().describe('The performance category label.'),
  value: z.number().describe('The score or value for that category.'),
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

// Generic Text Extraction Types

export const ExtractAndStructureDataInputSchema = z.object({
  textInput: z.string().describe('Unstructured text containing performance data.'),
});
export type ExtractAndStructureDataInput = z.infer<typeof ExtractAndStructureDataInputSchema>;

export const ExtractAndStructureDataOutputSchema = z.object({
    data: z.array(PerformanceRecordSchema).describe('An array of performance records extracted from the text.'),
});
export type ExtractAndStructureDataOutput = z.infer<typeof ExtractAndStructureDataOutputSchema>;
