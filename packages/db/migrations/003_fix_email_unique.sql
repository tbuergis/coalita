-- Migration 003: Fix email unique constraint to allow multiple minors without email
-- Replaces the full unique constraint with a partial index that excludes
-- placeholder addresses and empty strings.

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
DROP INDEX IF EXISTS profiles_email_unique;

CREATE UNIQUE INDEX profiles_email_unique
  ON profiles(email)
  WHERE email != '' AND email NOT LIKE '%@noemail.coalita.local';
