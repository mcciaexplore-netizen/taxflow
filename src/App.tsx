/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, getDocFromServer } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function App() {
  const [user, loading, error] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Test if we can reach Firestore
        await getDocFromServer(doc(db, '_connection_test_', 'ping'));
      } catch (err: any) {
        if (err.message?.includes('offline')) {
          setConnectionError("Could not connect to Firestore. Please check your Project ID and internet connection.");
        }
      }
    }
    testConnection();
  }, []);

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
        } catch (err: any) {
          console.error("Error initializing profile:", err);
          if (err.code === 'permission-denied') {
            setConnectionError("Permission denied. Please ensure you have deployed your Firestore Security Rules.");
          }
          setProfileLoading(false);
        }

        // Real-time listener
        unsubscribe = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setProfileLoading(false);
        }, (err: any) => {
          console.error("Profile listener error:", err);
          if (err.code === 'permission-denied') {
            setConnectionError("Permission denied. Please ensure you have deployed your Firestore Security Rules.");
          }
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-neutral-500 text-sm animate-pulse">Initializing your profile...</p>
        {connectionError && (
          <div className="max-w-md mx-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 font-medium">
              {connectionError}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {!user ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Auth />
        </div>
      ) : (
        <div className="min-h-screen">
          {profile ? (
            <Dashboard profile={profile} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
              <p className="text-neutral-600 mb-6">
                We couldn't load your profile. This usually happens if Firestore rules are blocking access.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-neutral-900 text-white rounded-lg"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>
      )}

      {(error || connectionError) && !profileLoading && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg shadow-lg max-w-sm">
          {error?.message || connectionError}
        </div>
      )}
    </div>
  );
}
