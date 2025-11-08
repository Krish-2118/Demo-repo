'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-district-performance-summary.ts';
import '@/ai/flows/extract-data-from-pdf.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/generate-improvement-suggestions.ts';
import '@/ai/flows/extract-and-structure-data.ts';
