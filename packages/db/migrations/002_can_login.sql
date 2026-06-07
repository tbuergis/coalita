-- Migration 002: can_login flag for minor profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS can_login boolean NOT NULL DEFAULT true;

-- Minors created without their own login start as false
-- Admin can later enable login for children who have a phone
UPDATE profiles SET can_login = false WHERE is_minor = true;
