'use server';
import { config } from 'dotenv';
// Load environment variables from .env file
config({ path: '.env' });

import '@/ai/flows/generate-district-performance-summary.ts';
import '@/ai/flows/extract-data-from-pdf.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/generate-improvement-suggestions.ts';
import '@/ai/flows/extract-and-structure-data.ts';
