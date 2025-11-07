'use server';

import { generateDistrictPerformanceSummary } from '@/ai/flows/generate-district-performance-summary';
import { extractDataFromPdf } from '@/ai/flows/extract-data-from-pdf';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { districts } from '@/lib/data';
import { revalidatePath } from 'next/cache';

// Helper function to initialize Firebase Admin SDK
function initAdmin() {
  if (!getApps().length) {
    // When running in a Google Cloud environment, the SDK can automatically
    // detect the service account credentials and project ID from the environment.
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
  return getFirestore();
}

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
    const firestore = initAdmin();

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
    const firestore = initAdmin();
    const recordsCollection = firestore.collection('records');
    const districtMap = new Map(districts.map(d => [d.name.toLowerCase(), d.id]));

    const batch = firestore.batch();

    data.forEach(row => {
        // Normalize district name from various possible keys
        const districtKey = Object.keys(row).find(k => k.toLowerCase() === 'district');
        if (!districtKey) {
            console.warn(`District column not found in row:`, row);
            return;
        }
        const districtName = row[districtKey]?.toString().trim().toLowerCase();
        const districtId = districtMap.get(districtName);

        if (!districtId) {
            console.warn(`District not found: ${row[districtKey]}`);
            return; // Skip this row
        }
        
        let recordDate;
        // Normalize date from various possible keys
        const dateKey = Object.keys(row).find(k => k.toLowerCase() === 'date');
        if (!dateKey) {
            console.warn(`Date column not found in row:`, row);
            return;
        }
        const dateValue = row[dateKey];

        if (dateValue instanceof Date) {
            recordDate = dateValue;
        } else if (typeof dateValue === 'number') { // Handle Excel serial date number
          recordDate = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
        } else { // Handle string dates
          recordDate = new Date(dateValue);
        }

        if (isNaN(recordDate.getTime())) {
            console.warn(`Invalid date for row:`, row);
            return; // Skip if date is invalid
        }

        // Normalize category
        const categoryKey = Object.keys(row).find(k => k.toLowerCase() === 'category');
        if (!categoryKey) {
            console.warn(`Category column not found in row:`, row);
            return;
        }
        
        // Normalize value
        const valueKey = Object.keys(row).find(k => k.toLowerCase() === 'value');
        if (!valueKey) {
            console.warn(`Value column not found in row:`, row);
            return;
        }

        const record = {
            districtId: districtId,
            category: row[categoryKey],
            value: Number(row[valueKey]),
            date: recordDate.toISOString(),
        };

        const docRef = recordsCollection.doc(); // Auto-generate ID
        batch.set(docRef, record);
    });

    await batch.commit();

    revalidatePath('/dashboard');
    revalidatePath('/leaderboard');

    return { success: true, message: 'Data uploaded successfully.' };
  } catch (error) {
    console.error('Error uploading data:', error);
    return { success: false, message: 'Failed to upload data.' };
  }
}

export async function parsePdf(fileAsDataUrl: string) {
  try {
    const result = await extractDataFromPdf({ pdfDataUri: fileAsDataUrl });
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error parsing PDF with AI:', error);
    return { success: false, message: 'Failed to parse PDF.' };
  }
}
