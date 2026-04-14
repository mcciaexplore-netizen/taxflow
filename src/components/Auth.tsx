import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
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

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
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
