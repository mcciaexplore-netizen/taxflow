/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, loading, error] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function setupProfileListener() {
      if (user) {
        setProfileLoading(true);
        const docRef = doc(db, 'users', user.uid);
        
        // Initial check/creation
        try {
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              role: 'client',
              createdAt: serverTimestamp(),
            };
            await setDoc(docRef, newProfile);
          }
        } catch (err) {
          console.error("Error initializing profile:", err);
        }

        // Real-time listener
        unsubscribe = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          }
          setProfileLoading(false);
        }, (err) => {
          console.error("Profile listener error:", err);
          setProfileLoading(false);
        });
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    }

    setupProfileListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center min-h-screen p-4"
          >
            <Auth />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen"
          >
            {profile && <Dashboard profile={profile} />}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg shadow-lg">
          {error.message}
        </div>
      )}
    </div>
  );
}
