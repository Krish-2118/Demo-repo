'use server';

import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export async function initializeFirebase() {
  if (!getApps().length) {
    // We are on the server, so we can use the service account
    try {
      return getSdks(initializeApp());
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      return getSdks(initializeApp({
        projectId: firebaseConfig.projectId,
      }));
    }
  }

  return getSdks(getApp());
}

export async function getSdks(firebaseApp: ReturnType<typeof getApp>) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}
