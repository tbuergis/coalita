-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────

CREATE TYPE member_status AS ENUM ('active', 'passive', 'honorary', 'resigned');

-- System-level persona a user can hold within an organization
CREATE TYPE persona_type AS ENUM (
  'vorstand',               -- Vereinsvorstand (board member)
  'funktionaer',            -- Funktionär (role-holder: trainer, kassier, etc.)
  'mitglied',               -- Reguläres Mitglied
  'erziehungsberechtigter', -- Guardian of a minor member
  'geschaeftsstelle'        -- Administrative staff / office
);

-- ─────────────────────────────────────────────
-- Organizations (multi-tenant)
-- ─────────────────────────────────────────────

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,         -- URL-safe identifier
  logo_url text,
  website text,
  email text,
  phone text,
  address jsonb,
  founded_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Profiles (persons — Zitadel ID as PK)
-- ─────────────────────────────────────────────

CREATE TABLE profiles (
  id text PRIMARY KEY,               -- Zitadel user ID (sub claim)
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
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
  is_minor boolean NOT NULL DEFAULT false,  -- true when birth_date < 18 years ago
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Households (Familien / Geschwisterrabatt)
-- ─────────────────────────────────────────────

CREATE TABLE households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,               -- e.g. "Familie Müller"
  discount_percent numeric(5,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE household_members (
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (household_id, profile_id)
);

-- ─────────────────────────────────────────────
-- Guardian relationships (Erziehungsberechtigte)
-- ─────────────────────────────────────────────

CREATE TABLE guardians (
  guardian_id text REFERENCES profiles(id) ON DELETE CASCADE,
  child_id text REFERENCES profiles(id) ON DELETE CASCADE,
  relationship text,               -- e.g. "Mutter", "Vater", "Grosselternteil"
  is_primary_contact boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (guardian_id, child_id),
  CHECK (guardian_id <> child_id)
);

-- ─────────────────────────────────────────────
-- Roles catalogue (per organization)
-- ─────────────────────────────────────────────

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,              -- e.g. "Kassier", "Trainer U12", "Eventmanager"
  persona persona_type NOT NULL,   -- which persona category this role belongs to
  description text,
  permissions jsonb,               -- future: granular feature flags
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

-- ─────────────────────────────────────────────
-- Member roles (person ↔ role, time-limited)
-- ─────────────────────────────────────────────

CREATE TABLE member_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date,                -- NULL = indefinite
  assigned_by text REFERENCES profiles(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (valid_until IS NULL OR valid_until > valid_from)
);

-- ─────────────────────────────────────────────
-- Membership fees
-- ─────────────────────────────────────────────

CREATE TABLE membership_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
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

-- ─────────────────────────────────────────────
-- Triggers
-- ─────────────────────────────────────────────

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

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER membership_fees_updated_at
  BEFORE UPDATE ON membership_fees FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER households_updated_at
  BEFORE UPDATE ON households FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER roles_updated_at
  BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER member_roles_updated_at
  BEFORE UPDATE ON member_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update is_minor based on birth_date
CREATE OR REPLACE FUNCTION sync_is_minor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.birth_date IS NOT NULL THEN
    NEW.is_minor := (NEW.birth_date > CURRENT_DATE - INTERVAL '18 years');
  ELSE
    NEW.is_minor := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_sync_is_minor
  BEFORE INSERT OR UPDATE OF birth_date ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_is_minor();

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_fees ENABLE ROW LEVEL SECURITY;

-- Members read their own profile
CREATE POLICY "members_read_own_profile"
  ON profiles FOR SELECT
  USING (id = current_setting('app.current_user_id', true));

-- Service role bypasses all RLS (backend app user has BYPASSRLS)
CREATE POLICY "service_role_all_profiles"
  ON profiles FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "members_read_own_fees"
  ON membership_fees FOR SELECT
  USING (member_id = current_setting('app.current_user_id', true));

CREATE POLICY "service_role_all_fees"
  ON membership_fees FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "service_role_all_organizations"
  ON organizations FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "service_role_all_households"
  ON households FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "service_role_all_household_members"
  ON household_members FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "service_role_all_guardians"
  ON guardians FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "service_role_all_roles"
  ON roles FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "service_role_all_member_roles"
  ON member_roles FOR ALL
  USING (current_setting('role', true) = 'service_role');

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────

CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_membership_number ON profiles(membership_number);
CREATE INDEX idx_profiles_is_minor ON profiles(is_minor);

CREATE INDEX idx_membership_fees_member_id ON membership_fees(member_id);
CREATE INDEX idx_membership_fees_due_date ON membership_fees(due_date);
CREATE INDEX idx_membership_fees_organization ON membership_fees(organization_id);

CREATE INDEX idx_member_roles_profile ON member_roles(profile_id);
CREATE INDEX idx_member_roles_role ON member_roles(role_id);
CREATE INDEX idx_member_roles_organization ON member_roles(organization_id);
CREATE INDEX idx_member_roles_valid_until ON member_roles(valid_until);

CREATE INDEX idx_roles_organization ON roles(organization_id);
CREATE INDEX idx_roles_persona ON roles(persona);

CREATE INDEX idx_guardians_child ON guardians(child_id);
CREATE INDEX idx_household_members_profile ON household_members(profile_id);
