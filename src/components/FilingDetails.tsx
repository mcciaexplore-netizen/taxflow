import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { TaxReturn, TaxDocument, UserProfile } from '../types';
import { 
  FileText, Upload, CheckCircle, AlertCircle, Clock, 
  ArrowLeft, Download, Trash2, Loader2, Shield, Plus,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QuerySection from './QuerySection';

import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

interface FilingDetailsProps {
  returnId: string;
  profile: UserProfile;
  onBack: () => void;
}

export default function FilingDetails({ returnId, profile, onBack }: FilingDetailsProps) {
  const [taxReturn, setTaxReturn] = useState<TaxReturn | null>(null);
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'queries'>('documents');

  useEffect(() => {
    const returnPath = `tax_returns/${returnId}`;
    const unsubReturn = onSnapshot(doc(db, 'tax_returns', returnId), (doc) => {
      if (doc.exists()) {
        setTaxReturn({ id: doc.id, ...doc.data() } as TaxReturn);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, returnPath);
      setLoading(false);
    });

    const docsPath = `tax_returns/${returnId}/documents`;
    const q = profile.role === 'client'
      ? query(collection(db, 'tax_returns', returnId, 'documents'), where('userId', '==', profile.uid))
      : query(collection(db, 'tax_returns', returnId, 'documents'));
      
    const unsubDocs = onSnapshot(q, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TaxDocument[];
      setDocuments(docsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, docsPath);
    });

    return () => {
      unsubReturn();
      unsubDocs();
    };
  }, [returnId]);

  const getRequiredDocs = () => {
    if (!taxReturn) return [];
    
    const baseDocs = [
      { id: 'pan', label: 'PAN Card', category: 'Basic' },
      { id: 'aadhaar', label: 'Aadhaar Card', category: 'Basic' },
      { id: 'bank_details', label: 'Bank Account Proof (Cancelled Cheque/Passbook)', category: 'Basic' },
      { id: 'tds_tcs', label: 'TDS/TCS Challans', category: 'Basic' },
      { id: 'advance_tax', label: 'Advance Tax Challans', category: 'Basic' },
    ];

    const incomeDocs: { id: string, label: string, category: string }[] = [];
    const sources = taxReturn.questionnaire?.natureOfIncome || [];

    if (sources.includes('salary')) {
      incomeDocs.push(
        { id: 'form16', label: 'Form 16 (Part A & B)', category: 'Salary' },
        { id: 'form12ba', label: 'Form 12BA (Perquisites)', category: 'Salary' },
        { id: 'hra_proof', label: 'HRA Proof (Rent Receipts/Landlord PAN)', category: 'Salary' },
        { id: 'deductions', label: '80C/80D Proofs (LIC, PF, Health Ins)', category: 'Salary' }
      );
    }

    if (sources.includes('house_property')) {
      incomeDocs.push(
        { id: 'rent_agreement', label: 'Rental Agreement', category: 'House Property' },
        { id: 'home_loan_int', label: 'Home Loan Interest Certificate', category: 'House Property' },
        { id: 'property_tax', label: 'Municipal Tax Receipts', category: 'House Property' }
      );
    }

    if (sources.includes('capital_gain')) {
      incomeDocs.push(
        { id: 'sale_deed', label: 'Sale Deed / Agreement', category: 'Capital Gains' },
        { id: 'purchase_deed', label: 'Purchase Deed / Cost Docs', category: 'Capital Gains' },
        { id: 'cg_statement', label: 'Capital Gains Statement (Broker)', category: 'Capital Gains' },
        { id: 'demat_statement', label: 'Demat Account Statement', category: 'Capital Gains' }
      );
    }

    if (sources.includes('business_presumptive') || sources.includes('business_regular')) {
      incomeDocs.push(
        { id: 'bank_statements', label: 'Business Bank Statements', category: 'Business' },
        { id: 'gst_returns', label: 'GST Returns (GSTR-1/3B)', category: 'Business' },
        { id: 'p_l_sheet', label: 'P&L and Balance Sheet', category: 'Business' }
      );
    }

    if (sources.includes('nri')) {
      incomeDocs.push(
        { id: 'passport', label: 'Passport (Travel Details)', category: 'NRI' },
        { id: 'trc', label: 'Tax Residency Certificate (TRC)', category: 'NRI' }
      );
    }

    return [...baseDocs, ...incomeDocs];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file || !taxReturn) return;

    // Restriction for Excel-only documents
    if (['cg_statement', 'demat_statement'].includes(docType)) {
      const allowedExtensions = ['.xlsx', '.xls', '.csv'];
      const fileName = file.name.toLowerCase();
      const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValid) {
        // We'll use a simple console error and maybe a state-based message if needed
        // For now, let's just prevent the upload
        console.error("Invalid file type. Excel required.");
        return;
      }
    }

    setUploading(docType);
    try {
      const storageRef = ref(storage, `returns/${returnId}/${docType}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'tax_returns', returnId, 'documents'), {
        userId: taxReturn.userId,
        uploaderId: profile.uid,
        returnId: returnId,
        name: file.name,
        type: docType,
        url: url,
        uploadedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!taxReturn) return <div>Filing not found.</div>;

  const requiredDocs = getRequiredDocs();

  return (
    <div className="space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-neutral-200"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900">AY {taxReturn.financialYear} Filing</h1>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-100">
              {taxReturn.status}
            </span>
          </div>
          <p className="text-sm text-neutral-500">Entity: {taxReturn.entityType}</p>
        </div>
      </header>

      <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'documents' 
              ? 'bg-white text-neutral-900 shadow-sm' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Documents
        </button>
        <button
          onClick={() => setActiveTab('queries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'queries' 
              ? 'bg-white text-neutral-900 shadow-sm' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Queries & Chat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'documents' ? (
            <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  Document Checklist
                </h2>
                <span className="text-xs font-medium text-neutral-500">
                  {documents.length} / {requiredDocs.length} Uploaded
                </span>
              </div>

              <div className="divide-y divide-neutral-100">
                {requiredDocs.map((req) => {
                  const uploaded = documents.filter(d => d.type === req.id);
                  const isUploading = uploading === req.id;

                  return (
                    <div key={req.id} className="p-6 hover:bg-neutral-50/30 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{req.category}</span>
                            {uploaded.length > 0 && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                          </div>
                          <h3 className="text-sm font-medium text-neutral-900">
                            {req.label}
                            {['cg_statement', 'demat_statement'].includes(req.id) && (
                              <span className="ml-2 text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                                EXCEL ONLY
                              </span>
                            )}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3">
                          {uploaded.map((doc) => (
                            <a 
                              key={doc.id}
                              href={doc.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100 hover:bg-emerald-100 transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              {doc.name.length > 15 ? doc.name.substring(0, 12) + '...' : doc.name}
                            </a>
                          ))}
                          
                          <label className={`relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            isUploading 
                              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                              : 'bg-neutral-900 text-white hover:bg-neutral-800'
                          }`}>
                            {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            {uploaded.length > 0 ? 'Add More' : 'Upload'}
                            <input 
                              type="file" 
                              className="hidden" 
                              disabled={isUploading}
                              accept={['cg_statement', 'demat_statement'].includes(req.id) ? ".xlsx,.xls,.csv" : undefined}
                              onChange={(e) => handleFileUpload(e, req.id)} 
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <QuerySection returnId={returnId} profile={profile} />
          )}
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Filing Status
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Case Created', status: 'completed' },
                { label: 'Documents Uploaded', status: documents.length > 0 ? 'completed' : 'pending' },
                { label: 'Expert Review', status: taxReturn.status === 'In Progress' ? 'active' : 'pending' },
                { label: 'Computation Shared', status: taxReturn.status === 'Review' ? 'active' : 'pending' },
                { label: 'ITR Filed', status: taxReturn.status === 'Filed' ? 'completed' : 'pending' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    step.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' :
                    step.status === 'active' ? 'border-primary text-primary animate-pulse' :
                    'border-neutral-200 text-neutral-300'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                  </div>
                  <span className={`text-sm font-medium ${step.status === 'pending' ? 'text-neutral-400' : 'text-neutral-900'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <h3 className="font-bold text-primary mb-2">Need Help?</h3>
            <p className="text-xs text-primary/70 leading-relaxed mb-4">
              Our tax experts are reviewing your documents. If we need more information, we will raise a query here.
            </p>
            <button className="w-full py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
              Chat with Expert
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
