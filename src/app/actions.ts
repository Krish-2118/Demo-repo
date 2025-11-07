'use server';

import { generateDistrictPerformanceSummary } from '@/ai/flows/generate-district-performance-summary';
import { collection, addDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';
import { districts } from '@/lib/data';
import { revalidatePath } from 'next/cache';

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
    const promises = data.map(row => {
        const districtName = row.district?.toString().trim().toLowerCase();
        const districtId = districtMap.get(districtName);

        if (!districtId) {
            console.warn(`District not found: ${row.district}`);
            return Promise.resolve(); // Skip this row
        }

        const record = {
            districtId: districtId,
            category: row.category,
            value: Number(row.value),
            date: new Date(row.date).toISOString(),
        };

        return addDoc(recordsCollection, record);
    });

    await Promise.all(promises);

    // Revalidate paths to show new data
    revalidatePath('/dashboard');
    revalidatePath('/leaderboard');

    return { success: true, message: 'Data uploaded successfully.' };
  } catch (error) {
    console.error('Error uploading data:', error);
    return { success: false, message: 'Failed to upload data.' };
  }
}
