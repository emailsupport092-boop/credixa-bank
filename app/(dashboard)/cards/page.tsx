'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/types';
import { CreditCard, PlusCircle, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  const fetchCards = async () => {
    const { data } = await supabase.from('cards').select('*').order('created_at');
    setCards(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCards(); }, []);

  const requestCard = async () => {
    setCreating(true);
    const { data: accounts } = await supabase.from('accounts').select('id').limit(1).single();
    if (!accounts) { setCreating(false); return; }
    await supabase.from('cards').insert({
      account_id: accounts.id,
      card_type: 'visa',
      card_name: 'Credixa Visa Card',
      status: 'pending',
    });
    await fetchCards();
    setCreating(false);
  };

  const toggleCard = async (card: Card) => {
    const newStatus = card.status === 'active' ? 'blocked' : 'active';
    await supabase.from('cards').update({ status: newStatus }).eq('id', card.id);
    await fetchCards();
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-36 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-20 bg-gray-100 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-10 w-36 bg-gray-200 dark:bg-slate-700 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2].map(i => (
            <div key={i} className="space-y-3">
              <div className="h-52 bg-gray-200 dark:bg-slate-700 rounded-2xl" />
              <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="h-32 bg-gray-100 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Card Manager</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">{cards.length} card{cards.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={requestCard}
          disabled={creating}
          className="flex items-center gap-2 bg-[#0066cc] hover:bg-[#004499] text-white font-semibold px-4 py-2 rounded-xl transition-all active:scale-[0.98] disabled:opacity-60"
        >
          <PlusCircle size={16} />
          {creating ? 'Requesting...' : 'Request Card'}
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50">
          <CreditCard size={40} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">No cards yet</p>
          <button onClick={requestCard} className="mt-3 text-[#0066cc] dark:text-blue-400 text-sm hover:underline">
            Request your first card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden ${
                card.card_type === 'visa'
                  ? 'bg-linear-to-br from-[#0066cc] to-[#002266]'
                  : 'bg-linear-to-br from-[#ef4444] to-[#991b1b]'
              }`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

                <div className="relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-yellow-400 w-10 h-7 rounded-md opacity-90" />
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      card.status === 'active' ? 'bg-white/20' : 'bg-red-500/60'
                    }`}>
                      {card.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xl font-mono tracking-widest mb-4">
                    •••• •••• •••• {card.last_four || '0000'}
                  </p>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-white/60 text-xs">Card Holder</p>
                      <p className="font-semibold text-sm">{card.card_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs">Expires</p>
                      <p className="font-semibold text-sm">
                        {card.expiry_month?.toString().padStart(2, '0') || '**'}/{card.expiry_year?.toString().slice(-2) || '**'}
                      </p>
                    </div>
                    <div className="text-2xl font-bold italic opacity-80">
                      {card.card_type === 'visa' ? 'VISA' : 'MC'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => toggleCard(card)}
                  className={`flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl text-sm font-medium transition-all ${
                    card.status === 'active'
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  {card.status === 'active' ? <Lock size={14} /> : <Unlock size={14} />}
                  {card.status === 'active' ? 'Block Card' : 'Unblock Card'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
