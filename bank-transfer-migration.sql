-- ============================================
-- CREDIXA BANK - BANK TRANSFER MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- Extend transactions table with bank wire fields
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS beneficiary_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_address TEXT,
  ADD COLUMN IF NOT EXISTS swift_code TEXT,
  ADD COLUMN IF NOT EXISTS routing_number TEXT,
  ADD COLUMN IF NOT EXISTS purpose TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS success_message TEXT;

-- Run this if the migration was already applied without success_message:
-- ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS success_message TEXT;

-- ============================================
-- BENEFICIARY ACCOUNTS TABLE (admin-managed)
-- ============================================
CREATE TABLE IF NOT EXISTS public.beneficiary_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_number TEXT NOT NULL UNIQUE,
  beneficiary_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  bank_address TEXT NOT NULL,
  swift_code TEXT,
  routing_number TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beneficiary_accounts_number
  ON public.beneficiary_accounts(account_number);

CREATE INDEX IF NOT EXISTS idx_beneficiary_accounts_active
  ON public.beneficiary_accounts(is_active);

-- ============================================
-- SYSTEM CONFIG TABLE (admin-managed key/value)
-- ============================================
CREATE TABLE IF NOT EXISTS public.system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default transfer messages
INSERT INTO public.system_config (key, value) VALUES
  ('transfer_success_message', 'Your transfer has been processed and credited to the recipient successfully.'),
  ('transfer_failure_message', 'Your transaction could not be processed. Please contact support for assistance.')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write config
CREATE POLICY "Service role manages system config"
  ON public.system_config FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.beneficiary_accounts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can look up active beneficiary accounts
CREATE POLICY "Users can view active beneficiary accounts"
  ON public.beneficiary_accounts FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Only service role can insert / update / delete
CREATE POLICY "Service role can manage beneficiary accounts"
  ON public.beneficiary_accounts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
