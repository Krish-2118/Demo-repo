"use client";
import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { firebaseConfig } from "./config";

interface FirebaseContextValue {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  googleProvider: GoogleAuthProvider;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseContextValue = useMemo(() => {
    const config = firebaseConfig;
    const app = !getApps().length ? initializeApp(config) : getApp();
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();
    return { app, firestore, auth, googleProvider };
  }, []);

  return (
    <FirebaseContext.Provider value={firebaseContextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebaseApp = (): FirebaseApp => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error(
      "useFirebaseApp must be used within a FirebaseClientProvider",
    );
  }
  return context.app;
};

export const useFirestore = (): Firestore => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error(
      "useFirestore must be used within a FirebaseClientProvider",
    );
  }
  return context.firestore;
};

export const useFirebaseAuth = (): Auth => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error(
      "useFirebaseAuth must be used within a FirebaseClientProvider",
    );
  }
  return context.auth;
};

export const useGoogleProvider = (): GoogleAuthProvider => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error(
      "useGoogleProvider must be used within a FirebaseClientProvider",
    );
  }
  return context.googleProvider;
};
