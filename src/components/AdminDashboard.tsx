import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, TaxReturn } from '../types';
import { Users, FileText, CheckCircle, AlertCircle, Search, Filter, MoreVertical, ArrowRight } from 'lucide-react';
import FilingDetails from './FilingDetails';

import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

interface AdminDashboardProps {
  profile: UserProfile;
}

export default function AdminDashboard({ profile }: AdminDashboardProps) {
  const [recentReturns, setRecentReturns] = useState<TaxReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);

  useEffect(() => {
    const returnsPath = 'tax_returns';
    const q = query(
      collection(db, 'tax_returns'),
      orderBy('updatedAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const returnsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TaxReturn[];
      setRecentReturns(returnsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, returnsPath);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          <h1 className="text-2xl font-bold text-neutral-900">Staff Control Panel</h1>
          <p className="text-neutral-500">Manage tax filings and client queries.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search cases..." 
              className="pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
          <button className="p-2 bg-white border border-neutral-200 rounded-lg text-neutral-500 hover:bg-neutral-50">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">NEW</span>
          </div>
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">New Leads</h3>
          <p className="text-3xl font-bold text-neutral-900 mt-1">12</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">In Progress</h3>
          <p className="text-3xl font-bold text-neutral-900 mt-1">45</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Queries</h3>
          <p className="text-3xl font-bold text-neutral-900 mt-1">8</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Filed Today</h3>
          <p className="text-3xl font-bold text-neutral-900 mt-1">5</p>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
          <h2 className="font-bold text-neutral-900">Recent Activity</h2>
          <button className="text-sm text-primary font-medium hover:underline">View All Cases</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Case ID</th>
                <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-400">Loading cases...</td>
                </tr>
              ) : recentReturns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">No active cases found.</td>
                </tr>
              ) : (
                recentReturns.map((ret) => (
                  <tr 
                    key={ret.id} 
                    onClick={() => setSelectedReturnId(ret.id)}
                    className="hover:bg-neutral-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Client ID: {ret.userId.substring(0, 8)}</p>
                          <p className="text-xs text-neutral-500">AY {ret.financialYear}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-neutral-500">
                      #{ret.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ret.status)}`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {ret.assignedStaffId ? `Staff ${ret.assignedStaffId.substring(0, 4)}` : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-neutral-400 hover:text-neutral-600">
                        <MoreVertical className="w-4 h-4" />
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
