import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, TaxReturn } from '../types';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NewFilingModal from './NewFilingModal';
import ServiceGallery from './ServiceGallery';
import FilingDetails from './FilingDetails';

interface ClientDashboardProps {
  profile: UserProfile;
}

export default function ClientDashboard({ profile }: ClientDashboardProps) {
  const [returns, setReturns] = useState<TaxReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
  const [showServicePlans, setShowServicePlans] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'tax_returns'),
      where('userId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const returnsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TaxReturn[];
      setReturns(returnsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching returns:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile.uid]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New': return <Plus className="w-4 h-4 text-blue-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Query Raised': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'Review': return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'Filed': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <FileText className="w-4 h-4 text-neutral-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Query Raised': return 'bg-red-50 text-red-700 border-red-100';
      case 'Review': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Filed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-neutral-50 text-neutral-700 border-neutral-100';
    }
  };

  if (selectedReturnId) {
    return <FilingDetails returnId={selectedReturnId} profile={profile} onBack={() => setSelectedReturnId(null)} />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome back, {profile.displayName?.split(' ')[0]}</h1>
          <p className="text-neutral-500">Track and manage your income tax filings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowServicePlans(!showServicePlans)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              showServicePlans 
                ? 'bg-neutral-100 border-neutral-300 text-neutral-900' 
                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {showServicePlans ? 'Hide Service Plans' : 'View Service Plans'}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-shadow shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Start New Filing
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showServicePlans && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ServiceGallery />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <NewFilingModal profile={profile} onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Active Cases</h3>
          <p className="text-3xl font-bold text-neutral-900 mt-1">
            {returns.filter(r => r.status !== 'Filed').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Completed</h3>
          <p className="text-3xl font-bold text-neutral-900 mt-1">
            {returns.filter(r => r.status === 'Filed').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Pending Queries</h3>
          <p className="text-3xl font-bold text-neutral-900 mt-1">
            {returns.filter(r => r.status === 'Query Raised').length}
          </p>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
          <h2 className="font-bold text-neutral-900">Your Tax Filings</h2>
          <button className="text-sm text-primary font-medium hover:underline">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Financial Year</th>
                <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-neutral-400">Loading filings...</td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-neutral-500 mb-4">No tax filings found.</p>
                    <button className="text-primary font-medium hover:underline">Start your first filing</button>
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr 
                    key={ret.id} 
                    onClick={() => setSelectedReturnId(ret.id)}
                    className="hover:bg-neutral-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-neutral-100 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-neutral-400" />
                        </div>
                        <span className="font-medium text-neutral-900">AY {ret.financialYear}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ret.status)}`}>
                        {getStatusIcon(ret.status)}
                        {ret.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {ret.updatedAt?.toDate().toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1 text-sm font-medium text-neutral-400 group-hover:text-primary transition-colors">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
