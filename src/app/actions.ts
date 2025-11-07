'use server';

import { generateDistrictPerformanceSummary } from '@/ai/flows/generate-district-performance-summary';
import { collection, addDoc, getFirestore, runTransaction, doc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { districts } from '@/lib/data';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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

export async function uploadPerformanceData(data: any[]) {
  const { firestore } = initializeFirebase();
  const recordsCollection = collection(firestore, 'records');
  const districtMap = new Map(districts.map(d => [d.name.toLowerCase(), d.id]));

  try {
    // Non-blocking writes
    for (const row of data) {
      const districtName = row.district?.toString().trim().toLowerCase();
      const districtId = districtMap.get(districtName);

      if (!districtId) {
        console.warn(`District not found: ${row.district}`);
        continue;
      }

      const record = {
        districtId: districtId,
        category: row.category,
        value: Number(row.value),
        date: new Date(row.date).toISOString(),
      };
      
      // Using the non-blocking function
      addDocumentNonBlocking(recordsCollection, record);
    }

    return { success: true, message: 'Data upload has started in the background.' };
  } catch (error) {
    console.error('Error initiating data upload:', error);
    return { success: false, message: 'Failed to initiate data upload.' };
  }
}
