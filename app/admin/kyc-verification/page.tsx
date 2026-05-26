'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function KYCVerificationPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from('kyc_submissions')
      .select('*, users(first_name, last_name, email)')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });
    setSubmissions(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const handleAction = async (id: string, userId: string, action: 'approved' | 'rejected') => {
    await supabase.from('kyc_submissions').update({ status: action, reviewed_at: new Date().toISOString() }).eq('id', id);
    await supabase.from('users').update({ kyc_status: action === 'approved' ? 'verified' : 'rejected' }).eq('id', userId);
    await fetchSubmissions();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>KYC Verification Queue</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{submissions.length} pending submissions</p>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'var(--bg-surface-2)' }} />)}</div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
            <p style={{ color: 'var(--text-secondary)' }}>No pending KYC submissions</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface-2)' }}>
                  {['User', 'ID Type', 'ID Number', 'Submitted', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} className="border-b transition-colors hover:bg-(--sidebar-hover)" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {sub.users?.first_name} {sub.users?.last_name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub.users?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{sub.id_type?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{sub.id_number}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {format(new Date(sub.submitted_at), 'MMM d, h:mm a')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(sub.id, sub.user_id, 'approved')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 transition-colors">
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button onClick={() => handleAction(sub.id, sub.user_id, 'rejected')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-colors">
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
