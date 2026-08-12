-- ============================================================
-- CREDIXA BANK — INTERNAL TRANSFER CREDITING
-- Run this in Supabase SQL Editor
--
-- The base schema already defines to_account_id / to_user_id on
-- public.transactions, but on some deployed databases the bank
-- transfer migration may have been applied before those columns
-- existed. This is a no-op if they're already there.
-- ============================================================

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS to_account_id UUID REFERENCES public.accounts(id),
  ADD COLUMN IF NOT EXISTS to_user_id UUID REFERENCES public.users(id);

CREATE INDEX IF NOT EXISTS idx_transactions_to_user ON public.transactions(to_user_id);
