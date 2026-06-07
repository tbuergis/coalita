-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Member status enum
CREATE TYPE member_status AS ENUM ('active', 'passive', 'honorary', 'resigned');

-- Profiles table
-- id corresponds to the Zitadel user ID (sub claim from OIDC token)
CREATE TABLE profiles (
  id text PRIMARY KEY, -- Zitadel user ID (e.g. "123456789012345678")
  membership_number text UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  birth_date date,
  address jsonb,
  joined_at date NOT NULL DEFAULT CURRENT_DATE,
  status member_status NOT NULL DEFAULT 'active',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Membership fees table
CREATE TABLE membership_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  due_date date NOT NULL,
  paid_at timestamptz,
  payment_method text,
  period_start date,
  period_end date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-increment membership_number trigger
CREATE SEQUENCE membership_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_membership_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.membership_number IS NULL THEN
    NEW.membership_number := 'M-' || LPAD(nextval('membership_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_membership_number
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_membership_number();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER membership_fees_updated_at
  BEFORE UPDATE ON membership_fees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_fees ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Authentication is handled by Zitadel (OIDC). The backend passes the
-- Zitadel user ID via a JWT claim set in app.current_user_id.
-- Members can read their own profile
CREATE POLICY "members_read_own_profile"
  ON profiles FOR SELECT
  USING (id = current_setting('app.current_user_id', true));

-- Service role bypasses RLS (used by backend service with SUPABASE_SERVICE_ROLE_KEY)
CREATE POLICY "service_role_all_profiles"
  ON profiles FOR ALL
  USING (current_setting('role', true) = 'service_role');

-- RLS Policies for membership_fees
CREATE POLICY "members_read_own_fees"
  ON membership_fees FOR SELECT
  USING (member_id = current_setting('app.current_user_id', true));

CREATE POLICY "service_role_all_fees"
  ON membership_fees FOR ALL
  USING (current_setting('role', true) = 'service_role');

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_membership_number ON profiles(membership_number);
CREATE INDEX idx_membership_fees_member_id ON membership_fees(member_id);
CREATE INDEX idx_membership_fees_due_date ON membership_fees(due_date);
