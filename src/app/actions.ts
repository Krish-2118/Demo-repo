'use server';

import { generateDistrictPerformanceSummary } from '@/ai/flows/generate-district-performance-summary';
import { extractDataFromPdf } from '@/ai/flows/extract-data-from-pdf';
import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { districts } from '@/lib/data';
import { revalidatePath } from 'next/cache';

// Helper to initialize Firebase Admin and return Firestore instance
function getAdminFirestore(): Firestore {
  if (!getApps().length) {
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
    const firestore = getAdminFirestore();

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
    const firestore = getAdminFirestore();
    const recordsCollection = firestore.collection('records');
    const districtMap = new Map(districts.map(d => [d.name.toLowerCase(), d.id]));

    const batch = firestore.batch();
    let recordsAdded = 0;

    for (const row of data) {
        const districtName = row['District']?.toString().trim().toLowerCase();
        const districtId = districtMap.get(districtName);
        
        if (!districtId) {
            console.warn(`District not found, skipping row:`, row);
            continue;
        }

        const dateValue = row['Date'];
        let recordDate: Date;
        
        if (dateValue instanceof Date) {
            recordDate = dateValue;
        } else if (typeof dateValue === 'number') { 
            // Excel stores dates as number of days since 1900-01-01.
            // 25569 is the number of days between 1900-01-01 and 1970-01-01 (Unix epoch).
            recordDate = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
        } else if (typeof dateValue === 'string') {
            recordDate = new Date(dateValue);
        } else {
            console.warn(`Invalid date format, skipping row:`, row);
            continue;
        }

        if (isNaN(recordDate.getTime())) {
            console.warn(`Invalid date value, skipping row:`, row);
            continue;
        }

        const category = row['Category'];
        const value = Number(row['Value']);

        if (!category || isNaN(value)) {
            console.warn('Invalid category or value, skipping row:', row);
            continue;
        }

        const record = {
            districtId: districtId,
            category: category,
            value: value,
            date: recordDate.toISOString(),
        };

        const docRef = recordsCollection.doc();
        batch.set(docRef, record);
        recordsAdded++;
    }

    if (recordsAdded === 0) {
      return { success: false, message: 'Upload failed. No valid records with recognizable districts and dates were found in the file. Please check the file content and format.' };
    }

    await batch.commit();

    revalidatePath('/dashboard');
    revalidatePath('/leaderboard');

    return { success: true, message: `${recordsAdded} records uploaded successfully.` };
  } catch (error) {
    console.error('Error uploading data:', error);
    return { success: false, message: 'Failed to upload data due to a server error.' };
  }
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
