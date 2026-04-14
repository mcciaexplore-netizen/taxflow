import { useState } from 'react';
import { UserProfile } from '../types';
import Navbar from './Navbar';
import ClientDashboard from './ClientDashboard';
import AdminDashboard from './AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  profile: UserProfile;
}

export default function Dashboard({ profile }: DashboardProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar profile={profile} />
      
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {profile.role === 'client' ? (
            <motion.div
              key="client"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ClientDashboard profile={profile} />
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AdminDashboard profile={profile} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="py-6 px-4 border-t border-neutral-200 bg-white text-center text-sm text-neutral-500">
        <p>© {new Date().getFullYear()} TaxFlow. All rights reserved. Compliance with IT Act, 1961.</p>
      </footer>
    </div>
  );
}
