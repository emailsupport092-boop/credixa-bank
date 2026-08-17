-- ============================================================
-- CREDIXA BANK — RECEIPTS & STATEMENTS
-- Run this in Supabase SQL Editor
--
-- The transfer flow never actually stored the beneficiary's account
-- number on the transaction row (only the name/bank fields), so a
-- printed receipt had nothing to show for it. Backfilling that here.
-- ============================================================

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS beneficiary_account_number TEXT;
