'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  avatar: string;
  balance: number;
  vipLevel: number;
  vipXP: number;
  totalWagered: number;
  totalWon: number;
  gamesPlayed: number;
  joinDate: string;
  referralCode: string;
  streak: number;
  lastLogin: string;
  biggestWin: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, avatar: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateBalance: (amount: number) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateReferralCode(uid: string): string {
  return 'GUPTA' + uid.slice(0, 6).toUpperCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const unsubProfile = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            setUserProfile({ uid: firebaseUser.uid, ...snap.data() } as UserProfile);
          }
          setLoading(false);
        });
        return () => unsubProfile();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string, avatar: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const { user: newUser } = credential;
    try {
      await sendEmailVerification(newUser);
    } catch {
      // non-critical
    }
    const profileData: Omit<UserProfile, 'uid'> = {
      email,
      username,
      avatar,
      balance: 10000,
      vipLevel: 0,
      vipXP: 0,
      totalWagered: 0,
      totalWon: 0,
      gamesPlayed: 0,
      joinDate: new Date().toISOString(),
      referralCode: generateReferralCode(newUser.uid),
      streak: 1,
      lastLogin: new Date().toISOString(),
      biggestWin: 0,
    };
    await setDoc(doc(db, 'users', newUser.uid), {
      ...profileData,
      createdAt: serverTimestamp(),
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const updateBalance = useCallback(async (amount: number) => {
    if (!user) return;
    const newBalance = (userProfile?.balance ?? 0) + amount;
    // Optimistic update
    setUserProfile((prev) => prev ? { ...prev, balance: newBalance } : prev);
    try {
      await updateDoc(doc(db, 'users', user.uid), { balance: newBalance });
    } catch {
      // Revert
      setUserProfile((prev) => prev ? { ...prev, balance: (prev.balance ?? 0) - amount } : prev);
    }
  }, [user, userProfile]);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return;
    setUserProfile((prev) => prev ? { ...prev, ...data } : prev);
    try {
      await updateDoc(doc(db, 'users', user.uid), data as Record<string, unknown>);
    } catch {
      // silent
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signUp, signIn, signOut, resetPassword, updateBalance, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
