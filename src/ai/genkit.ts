import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This configures Genkit to use the an API key for Google AI.
// The API key is loaded from the `GEMINI_API_KEY` environment variable.
export const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API_KEY
  })],
  model: 'googleai/gemini-2.5-flash',
});
