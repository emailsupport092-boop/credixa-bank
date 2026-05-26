-- ============================================================
-- CREDIXA BANK — 2FA MIGRATION
-- Run this in Supabase SQL Editor AFTER the main schema
-- ============================================================

-- 1. Add 2FA flag to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. OTP codes table
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code_hash   TEXT        NOT NULL,
  attempts    INTEGER     NOT NULL DEFAULT 0,
  used        BOOLEAN     NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_user_id    ON public.otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON public.otp_codes(expires_at);

-- 3. Enable RLS on otp_codes
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Users can only see/insert their own OTP rows (server uses service role)
CREATE POLICY "Users can view own otps" ON public.otp_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role manages otps" ON public.otp_codes
  FOR ALL USING (auth.role() = 'service_role');

-- 4. Auto-cleanup: delete expired OTP codes older than 1 hour
-- (Supabase doesn't run cron natively on free tier, so this is
--  handled in the verify API. Optionally set up pg_cron on Pro.)

-- To manually clean up:
-- DELETE FROM public.otp_codes WHERE expires_at < NOW() - INTERVAL '1 hour';

-- 5. Verify the migration
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name = 'two_factor_enabled';
