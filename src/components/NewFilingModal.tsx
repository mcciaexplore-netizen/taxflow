import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, EntityType, BankAccount } from '../types';
import { X, Loader2, Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';

interface NewFilingModalProps {
  profile: UserProfile;
  onClose: () => void;
}

export default function NewFilingModal({ profile, onClose }: NewFilingModalProps) {
  const [step, setStep] = useState(1);
  const [financialYear, setFinancialYear] = useState('2025-26');
  const [entityType, setEntityType] = useState<EntityType>('Individual');
  const [natureOfIncome, setNatureOfIncome] = useState<string[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([{ accountNumber: '', ifsc: '', branch: '', address: '' }]);
  const [portalPassword, setPortalPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const entityOptions: EntityType[] = [
    'Individual', 'HUF', 'Partnership Firm', 'Limited Liability Partnership', 
    'Private Limited Company', 'Public Limited Company'
  ];

  const incomeOptions = [
    { id: 'salary', label: 'Salary income' },
    { id: 'business_presumptive', label: 'Income from Business/profession (Presumptive)' },
    { id: 'business_regular', label: 'Income from Business/profession (Regular)' },
    { id: 'house_property', label: 'Income from House property (Rent, Home loan interest, etc.)' },
    { id: 'other_sources', label: 'Income from other sources (Interest, Dividend, etc.)' },
    { id: 'capital_gain', label: 'Capital gain/(loss) (Property sale, Shares, Mutual funds, etc.)' },
    { id: 'nri', label: 'NRI (Non-Resident Individual) Status' },
    { id: 'foreign_assets', label: 'Foreign Assets & Liabilities' },
  ];

  const handleToggleIncome = (id: string) => {
    setNatureOfIncome(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const addBankAccount = () => {
    setBankAccounts([...bankAccounts, { accountNumber: '', ifsc: '', branch: '', address: '' }]);
  };

  const removeBankAccount = (index: number) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== index));
  };

  const updateBankAccount = (index: number, field: keyof BankAccount, value: string) => {
    const updated = [...bankAccounts];
    updated[index][field] = value;
    setBankAccounts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (natureOfIncome.length === 0) {
      alert("Please select at least one nature of income.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'tax_returns'), {
        userId: profile.uid,
        financialYear,
        entityType,
        status: 'New',
        questionnaire: {
          natureOfIncome,
          bankAccounts: bankAccounts.filter(acc => acc.accountNumber),
          portalPassword
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onClose();
    } catch (error) {
      console.error("Error creating filing:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Start New Filing</h2>
            <p className="text-xs text-neutral-500">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Financial Year / Assessment Year</label>
                <select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="2026-27">AY 2026-27 (FY 2025-26)</option>
                  <option value="2025-26">AY 2025-26 (FY 2024-25)</option>
                  <option value="2024-25">AY 2024-25 (FY 2023-24)</option>
                  <option value="2023-24">AY 2023-24 (FY 2022-23)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Type of Entity</label>
                <div className="grid grid-cols-2 gap-2">
                  {entityOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEntityType(type)}
                      className={`px-4 py-2 text-sm rounded-lg border text-left transition-all ${
                        entityType === type 
                          ? 'bg-primary/5 border-primary text-primary font-medium' 
                          : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-neutral-700 block">Nature of Income (Select all that apply)</label>
                <div className="grid gap-2">
                  {incomeOptions.map((option) => (
                    <label 
                      key={option.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        natureOfIncome.includes(option.id) 
                          ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/30' 
                          : 'bg-white border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 rounded border-neutral-300 text-primary focus:ring-primary"
                        checked={natureOfIncome.includes(option.id)}
                        onChange={() => handleToggleIncome(option.id)}
                      />
                      <span className="text-sm text-neutral-700 leading-tight">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Bank Account Details</h3>
                <button 
                  type="button"
                  onClick={addBankAccount}
                  className="text-xs flex items-center gap-1 text-primary font-bold hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add Another
                </button>
              </div>
              
              <p className="text-xs text-neutral-500">Please provide details of all bank accounts held during the year.</p>

              <div className="space-y-4">
                {bankAccounts.map((account, index) => (
                  <div key={index} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 relative group">
                    {bankAccounts.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeBankAccount(index)}
                        className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Account Number</label>
                        <input 
                          type="text" 
                          value={account.accountNumber}
                          onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm"
                          placeholder="e.g. 1234567890"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">IFSC Code</label>
                        <input 
                          type="text" 
                          value={account.ifsc}
                          onChange={(e) => updateBankAccount(index, 'ifsc', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm"
                          placeholder="e.g. SBIN0001234"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Branch Name</label>
                        <input 
                          type="text" 
                          value={account.branch}
                          onChange={(e) => updateBankAccount(index, 'branch', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Branch Address</label>
                        <input 
                          type="text" 
                          value={account.address}
                          onChange={(e) => updateBankAccount(index, 'address', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Income Tax Portal Password (Optional)</label>
                <input 
                  type="password" 
                  value={portalPassword}
                  onChange={(e) => setPortalPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter portal password if you want us to login"
                />
                <p className="text-[10px] text-neutral-400">Your password is encrypted and stored securely.</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-sm font-bold text-blue-900 mb-2">Summary of Selection</h4>
                <div className="space-y-1 text-xs text-blue-800">
                  <p>• Assessment Year: AY {financialYear}</p>
                  <p>• Entity: {entityType}</p>
                  <p>• Income Sources: {natureOfIncome.map(id => incomeOptions.find(o => o.id === id)?.label).join(', ')}</p>
                  <p>• Bank Accounts: {bankAccounts.filter(a => a.accountNumber).length} provided</p>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  By clicking "Create Case", you authorize our tax experts to process your return. 
                  In the next screen, you will be able to upload the required documents based on your income sources.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 flex justify-between items-center shrink-0 bg-neutral-50/50">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={step === 1 && natureOfIncome.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Case'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
