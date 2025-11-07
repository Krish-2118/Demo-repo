'use server';

import { generateDistrictPerformanceSummary } from '@/ai/flows/generate-district-performance-summary';
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

export async function uploadManualRecord(data: {districtId: number, category: string, value: number, date: Date}) {
  try {
    const { firestore } = await initializeFirebase();
    const record = {
      districtId: data.districtId,
      category: data.category,
      value: Number(data.value),
      date: data.date.toISOString(),
    };
    await firestore.collection('records').add(record);
    
    revalidatePath('/dashboard');
    revalidatePath('/leaderboard');

    return { success: true, message: 'Record added successfully.' };
  } catch (error) {
    console.error('Error uploading manual record:', error);
    return { success: false, message: 'Failed to add record.' };
  }
}


export async function uploadPerformanceData(data: any[]) {
  try {
    const { firestore } = await initializeFirebase();
    const recordsCollection = firestore.collection('records');
    const districtMap = new Map(districts.map(d => [d.name.toLowerCase(), d.id]));

    const batch = firestore.batch();

    data.forEach(row => {
        const districtName = row.district?.toString().trim().toLowerCase();
        const districtId = districtMap.get(districtName);

        if (!districtId) {
            console.warn(`District not found: ${row.district}`);
            return; // Skip this row
        }
        
        let recordDate;
        // The input `row.date` can be a Date object (from manual form) or a string/number (from file upload).
        if (row.date instanceof Date) {
            recordDate = row.date;
        } else if (typeof row.date === 'number') { // Handle Excel serial date number
          // This formula converts Excel's serial date number to a JS Date.
          // It assumes the date is not from the 1900 bug era in Excel.
          recordDate = new Date(Math.round((row.date - 25569) * 86400 * 1000));
        } else { // Handle string dates
          recordDate = new Date(row.date);
        }

        if (isNaN(recordDate.getTime())) {
            console.warn(`Invalid date for row:`, row);
            return; // Skip if date is invalid
        }

        const record = {
            districtId: districtId,
            category: row.category,
            value: Number(row.value),
            date: recordDate.toISOString(),
        };

        const docRef = recordsCollection.doc(); // Auto-generate ID
        batch.set(docRef, record);
    });

    await batch.commit();

    // Revalidate paths to show new data
    revalidatePath('/dashboard');
    revalidatePath('/leaderboard');

    return { success: true, message: 'Data uploaded successfully.' };
  } catch (error) {
    console.error('Error uploading data:', error);
    // Return a more specific error if possible, but for now, this is okay.
    return { success: false, message: 'Failed to upload data.' };
  }
}
