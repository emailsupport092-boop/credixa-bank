'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function LoansApprovalPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    const res = await fetch('/api/admin/loans');
    const data = await res.json();
    setLoans(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    await fetch('/api/admin/loans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    await fetchLoans();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Loan Approvals</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{loans.length} pending applications</p>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'var(--bg-surface-2)' }} />)}</div>
        ) : loans.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No pending loan applications</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface-2)' }}>
                  {['Applicant', 'Amount', 'Term', 'Monthly', 'Rate', 'Applied', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-b transition-colors hover:bg-(--sidebar-hover)" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {loan.users?.first_name} {loan.users?.last_name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{loan.users?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      ${loan.principal_amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{loan.loan_term} mo.</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#0066cc]">
                      ${loan.monthly_payment?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{loan.interest_rate}%</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {format(new Date(loan.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(loan.id, 'approved')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 transition-colors">
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button onClick={() => handleAction(loan.id, 'rejected')}
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
