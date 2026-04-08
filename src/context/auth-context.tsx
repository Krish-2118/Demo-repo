"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  type Firestore,
  getDoc,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import {
  useFirebaseAuth,
  useFirestore,
  useGoogleProvider,
} from "@/firebase/client";

export type AppRole = "admin" | "viewer";

type UserProfile = {
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: AppRole;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

type AuthContextValue = {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureUserProfile(
  firestore: Firestore,
  uid: string,
  profile: Omit<UserProfile, "role">,
  defaultRole: AppRole = "viewer",
): Promise<AppRole> {
  const profileRef = doc(firestore, "users", uid);
  const existing = await getDoc(profileRef);

  if (!existing.exists()) {
    await setDoc(profileRef, {
      ...profile,
      role: defaultRole,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return defaultRole;
  }

  const data = existing.data() as Partial<UserProfile>;
  const role = data.role === "admin" ? "admin" : "viewer";

  await setDoc(
    profileRef,
    {
      email: profile.email,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return role;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const googleProvider = useGoogleProvider();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const syncProfileAndRole = useCallback(
    async (firebaseUser: User) => {
      const resolvedRole = await ensureUserProfile(
        firestore,
        firebaseUser.uid,
        {
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        },
      );
      setRole(resolvedRole);
    },
    [firestore],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);

      if (!firebaseUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        await syncProfileAndRole(firebaseUser);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [auth, syncProfileAndRole]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim();

      await signInWithEmailAndPassword(auth, normalizedEmail, password);
    },
    [auth],
  );

  const sendPasswordReset = useCallback(
    async (email: string) => {
      await sendPasswordResetEmail(auth, email);
    },
    [auth],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const normalizedEmail = email.trim();

      const result = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      await syncProfileAndRole(result.user);
    },
    [auth, syncProfileAndRole],
  );

  const signInWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await syncProfileAndRole(result.user);
  }, [auth, googleProvider, syncProfileAndRole]);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      loading,
      signInWithEmail,
      sendPasswordReset,
      signUpWithEmail,
      signInWithGoogle,
      signOutUser,
      isAdmin: role === "admin",
    }),
    [
      loading,
      role,
      signInWithEmail,
      sendPasswordReset,
      signInWithGoogle,
      signOutUser,
      signUpWithEmail,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
