'use server';
/**
 * @fileOverview An AI flow to generate improvement suggestions for a district's performance.
 *
 * - generateImprovementSuggestions - A function that generates improvement suggestions.
 * - GenerateImprovementSuggestionsInput - The input type for the function.
 * - GenerateImprovementSuggestionsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { 
    GenerateImprovementSuggestionsInputSchema, 
    GenerateImprovementSuggestionsOutputSchema,
    type GenerateImprovementSuggestionsInput,
    type GenerateImprovementSuggestionsOutput
} from '@/lib/types';


export async function generateImprovementSuggestions(input: GenerateImprovementSuggestionsInput): Promise<GenerateImprovementSuggestionsOutput> {
  return generateImprovementSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImprovementSuggestionsPrompt',
  input: { schema: GenerateImprovementSuggestionsInputSchema },
  output: { schema: GenerateImprovementSuggestionsOutputSchema },
  prompt: `You are an expert police performance analyst and consultant. Your task is to provide specific, actionable suggestions for the district of {{{districtName}}} based on their lowest-performing areas.

The goal is to provide 3-4 concrete recommendations that the district can implement to improve its scores.

Here is the performance data for the district's weakest categories:
{{#each performanceData}}
- Category: {{{category}}}, Score: {{{value}}}
{{/each}}

Based on this data, generate a list of practical suggestions. Focus on realistic and impactful actions.`,
});

const generateImprovementSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateImprovementSuggestionsFlow',
    inputSchema: GenerateImprovementSuggestionsInputSchema,
    outputSchema: GenerateImprovementSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
