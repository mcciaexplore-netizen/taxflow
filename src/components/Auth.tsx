import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login failed:", err);
      
      // Provide user-friendly error messages
      if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized in Firebase. Please add the app URL to 'Authorized Domains' in Firebase Console.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked. Please allow popups for this site.");
      } else if (err.code === 'auth/configuration-not-found') {
        setError("Google Sign-In is not enabled in your Firebase project.");
      } else if (err.code === 'auth/invalid-api-key') {
        setError("Invalid Firebase API Key. Please check your Secrets configuration.");
      } else {
        setError(err.message || "An unexpected error occurred during sign-in.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200">
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">TaxFlow</h1>
        <p className="text-neutral-500 mb-8">
          Professional ITR processing & compliance platform.
          Securely manage your tax filings with expert assistance.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 font-medium">
              {error}
            </div>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          {loading ? "Connecting..." : "Sign in with Google"}
        </button>

        <p className="mt-6 text-xs text-neutral-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
          Data is processed as per Income-tax Act, 1961.
        </p>
      </div>
      
      <div className="bg-neutral-50 px-8 py-4 border-t border-neutral-100">
        <div className="flex justify-between items-center text-xs text-neutral-500">
          <span>Secure 256-bit Encryption</span>
          <span>Compliance Ready</span>
        </div>
      </div>
    </div>
  );
}
