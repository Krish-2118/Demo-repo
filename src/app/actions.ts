'use server';

import { generateDistrictPerformanceSummary } from '@/ai/flows/generate-district-performance-summary';

export async function getAiSummary() {
  try {
    const result = await generateDistrictPerformanceSummary({
      districtName: 'Ganjam',
      category: 'Narcotics',
      value: 18,
      date: 'May 2023',
      improvementPercentage: 42,
    });
    return result.summary;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return 'Could not generate summary at this time.';
  }
}
