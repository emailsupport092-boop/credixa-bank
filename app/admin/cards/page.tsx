'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export default function CardRequestsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchCards = async () => {
    const { data } = await supabase
      .from('cards')
      .select('*, users(first_name, last_name, email), accounts(account_number)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setCards(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCards(); }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    await supabase
      .from('cards')
      .update({ status: action === 'approved' ? 'active' : 'blocked' })
      .eq('id', id);
    await fetchCards();
  };

  const cardTypeColor: Record<string, string> = {
    visa:       'bg-blue-500/10 text-blue-500',
    mastercard: 'bg-orange-500/10 text-orange-500',
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Card Requests</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{cards.length} pending requests</p>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'var(--bg-surface-2)' }} />)}</div>
        ) : cards.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No pending card requests</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>All requests have been processed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface-2)' }}>
                  {['Cardholder', 'Card Name', 'Type', 'Account', 'Requested', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id} className="border-b transition-colors hover:bg-(--sidebar-hover)" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0066cc] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {card.users?.first_name?.[0]}{card.users?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            {card.users?.first_name} {card.users?.last_name}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.users?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {card.card_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${cardTypeColor[card.card_type] || 'bg-gray-500/10 text-gray-500'}`}>
                        {card.card_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {card.accounts?.account_number || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {format(new Date(card.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(card.id, 'approved')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 transition-colors">
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button onClick={() => handleAction(card.id, 'rejected')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-colors">
                          <XCircle size={13} /> Decline
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
