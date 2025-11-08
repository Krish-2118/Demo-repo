'use server';

import { generateDistrictPerformanceSummary } from '@/ai/flows/generate-district-performance-summary';
import { extractDataFromPdf } from '@/ai/flows/extract-data-from-pdf';

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

export async function uploadManualRecord(data: {districtId: number, category: string, value: number, date: Date}) {
    console.log("DEMO: Manual record submitted but not saved to a database:", data);
    // This is a placeholder. In a real app, you would save this to a database.
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Record submitted successfully (demo only).' };
}


export async function uploadPerformanceData(data: any[]) {
    console.log("DEMO: Performance data from file submitted but not saved to a database:", data);
    // This is a placeholder. In a real app, you would save this to a database.
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: `${data.length} records processed successfully (demo only).` };
}

export async function parsePdf(fileAsDataUrl: string) {
  try {
    const result = await extractDataFromPdf({ pdfDataUri: fileAsDataUrl });
    if (result && result.data) {
        return { success: true, data: result.data };
    }
    return { success: false, message: 'AI could not find data in the PDF.' };
  } catch (error) {
    console.error('Error parsing PDF with AI:', error);
    return { success: false, message: 'Failed to parse PDF.' };
  }
}
