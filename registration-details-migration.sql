-- ============================================
-- CREDIXA BANK - REGISTRATION DETAILS MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================
-- Registration now collects the personal details required to open
-- a real bank account (not just name/email/password), so the
-- users table needs a couple of extra columns to store them.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;
