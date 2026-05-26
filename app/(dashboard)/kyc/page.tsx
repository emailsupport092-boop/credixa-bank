'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { kycStep1Schema, kycStep2Schema, KYCStep1FormData, KYCStep2FormData } from '@/lib/validators/auth';
import { CheckCircle, Clock, Shield, User, FileText, Upload, ChevronRight, BookOpen, Car, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 1 | 2;

const docTypes = [
  { value: 'passport',       label: 'Passport',          desc: 'International',    icon: BookOpen },
  { value: 'drivers_license', label: "Driver's License",  desc: 'State / national', icon: Car },
  { value: 'national_id',    label: 'National ID',        desc: 'Government ID',    icon: CreditCard },
];

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20';

export default function KYCPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [step1Data, setStep1Data] = useState<KYCStep1FormData | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState('');

  useEffect(() => {
    fetch('/api/kyc').then(r => r.json()).then(data => {
      if (data?.status) setKycStatus(data.status);
    });
  }, []);

  const form1 = useForm<KYCStep1FormData>({ resolver: zodResolver(kycStep1Schema) });
  const form2 = useForm<KYCStep2FormData>({ resolver: zodResolver(kycStep2Schema) });

  const onStep1 = (data: KYCStep1FormData) => { setStep1Data(data); setStep(2); };

  const onStep2 = async (data: KYCStep2FormData) => {
    if (!step1Data) return;
    const res = await fetch('/api/kyc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...step1Data, ...data }),
    });
    if (res.ok) {
      setSubmitted(true);
      setKycStatus('pending');
    } else {
      const err = await res.json();
      alert(err.error || 'Submission failed');
    }
  };

  if (kycStatus === 'verified') {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={36} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <CheckCircle size={14} /> Verified
          </span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Identity Verified</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
            Your identity has been successfully verified. You have full access to all Credixa banking features.
          </p>
        </div>
      </div>
    );
  }

  if (kycStatus === 'pending' || submitted) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-10 text-center">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock size={36} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <span className="inline-flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Clock size={14} /> Under Review
          </span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">KYC Submitted</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
            Your documents are under review. This typically takes{' '}
            <span className="font-semibold text-gray-700 dark:text-white">2–3 business days</span>.
            We'll notify you by email.
          </p>
          <div className="mt-6 bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 text-left space-y-2.5">
            {[
              { label: 'Documents received', done: true },
              { label: 'Initial review in progress', done: false },
              { label: 'Final verification pending', done: false },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm">
                {done
                  ? <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                  : <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-slate-600 shrink-0" />
                }
                <span className={done ? 'text-gray-700 dark:text-slate-300' : 'text-gray-400 dark:text-slate-500'}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Identity Verification</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm">Complete KYC to unlock all banking features</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center">
        {[
          { n: 1, label: 'Personal Info', icon: User },
          { n: 2, label: 'Documents',     icon: FileText },
        ].map(({ n, label, icon: Icon }, i) => (
          <div key={n} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                step > n  ? 'bg-emerald-500 text-white' :
                step === n ? 'bg-[#0066cc] text-white ring-4 ring-blue-100 dark:ring-blue-900/40' :
                             'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
              }`}>
                {step > n ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${
                step === n ? 'text-[#0066cc] dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'
              }`}>
                {label}
              </span>
            </div>
            {i === 0 && (
              <div className={`flex-1 h-0.5 mx-4 mb-5 transition-colors ${
                step > 1 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 rounded-xl flex items-center justify-center">
                <User size={20} className="text-[#0066cc] dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                <p className="text-xs text-gray-400 dark:text-slate-500">Enter your legal details as they appear on your ID</p>
              </div>
            </div>

            <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'first_name', label: 'First Name', placeholder: 'John' },
                  { name: 'last_name',  label: 'Last Name',  placeholder: 'Doe' },
                ].map(({ name, label, placeholder }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...form1.register(name as any)}
                      placeholder={placeholder}
                      defaultValue={(user as any)?.[name] || ''}
                      className={inputCls}
                    />
                    {(form1.formState.errors as any)[name] && (
                      <p className="text-xs text-red-500 mt-1">{(form1.formState.errors as any)[name]?.message}</p>
                    )}
                  </div>
                ))}
              </div>

              {[
                { name: 'date_of_birth', label: 'Date of Birth',  type: 'date', placeholder: '' },
                { name: 'nationality',   label: 'Nationality',    type: 'text', placeholder: 'United States' },
                { name: 'phone',         label: 'Phone Number',   type: 'tel',  placeholder: '+1 (555) 000-0000' },
                { name: 'address',       label: 'Full Address',   type: 'text', placeholder: '123 Main St, New York, NY 10001' },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                    {label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...form1.register(name as any)}
                    type={type}
                    placeholder={placeholder}
                    className={`${inputCls} [color-scheme:auto]`}
                  />
                  {(form1.formState.errors as any)[name] && (
                    <p className="text-xs text-red-500 mt-1">{(form1.formState.errors as any)[name]?.message}</p>
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="w-full bg-[#0066cc] hover:bg-[#004499] text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Continue to Documents
                <ChevronRight size={18} />
              </button>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-[#0066cc] dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Document Verification</h2>
                <p className="text-xs text-gray-400 dark:text-slate-500">Select and provide your ID document</p>
              </div>
            </div>

            <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-5">
              {/* Doc type cards */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                  ID Type <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {docTypes.map(({ value, label, desc, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setSelectedDoc(value); form2.setValue('id_type', value as any); }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                        selectedDoc === value
                          ? 'border-[#0066cc] dark:border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                          : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <Icon size={24} className={selectedDoc === value ? 'text-[#0066cc] dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'} />
                      <span className={`text-xs font-semibold leading-tight ${selectedDoc === value ? 'text-[#0066cc] dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}`}>
                        {label}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-slate-500 leading-tight">{desc}</span>
                    </button>
                  ))}
                </div>
                {form2.formState.errors.id_type && (
                  <p className="text-xs text-red-500 mt-2">{form2.formState.errors.id_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Document Number <span className="text-red-500">*</span>
                </label>
                <input
                  {...form2.register('id_number')}
                  placeholder={
                    selectedDoc === 'passport'        ? 'AB123456' :
                    selectedDoc === 'drivers_license' ? 'DL-1234-5678' :
                    'Enter document number'
                  }
                  className={`${inputCls} font-mono`}
                />
                {form2.formState.errors.id_number && (
                  <p className="text-xs text-red-500 mt-1">{form2.formState.errors.id_number.message}</p>
                )}
              </div>

              {/* Upload zone */}
              <div className="border-2 border-dashed border-gray-200 dark:border-slate-600 hover:border-[#0066cc] dark:hover:border-blue-500 rounded-xl p-8 text-center transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-gray-50 dark:bg-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Upload size={22} className="text-gray-400 dark:text-slate-500 group-hover:text-[#0066cc] dark:group-hover:text-blue-400 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 group-hover:text-[#0066cc] dark:group-hover:text-blue-400 transition-colors">
                  Upload your document
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">PNG, JPG or PDF · Max 10MB</p>
                <button type="button" className="mt-3 text-sm text-[#0066cc] dark:text-blue-400 font-medium hover:underline">
                  Browse files
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={form2.formState.isSubmitting}
                  className="flex-1 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {form2.formState.isSubmitting
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Shield size={18} /> Submit Verification</>
                  }
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
