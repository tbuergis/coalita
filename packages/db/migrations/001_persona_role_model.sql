-- Migration 001: Persona & Role Model
-- Run this against an existing DB that already has profiles + membership_fees from schema.sql v1.

-- New enum for persona types
DO $$ BEGIN
  CREATE TYPE persona_type AS ENUM (
    'vorstand',
    'funktionaer',
    'mitglied',
    'erziehungsberechtigter',
    'geschaeftsstelle'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Organizations (multi-tenant)
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  website text,
  email text,
  phone text,
  address jsonb,
  founded_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_organizations"
  ON organizations FOR ALL
  USING (current_setting('role', true) = 'service_role');

-- Add columns to existing profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_minor boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_minor ON profiles(is_minor);

-- Trigger: auto-sync is_minor
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

DROP TRIGGER IF EXISTS profiles_sync_is_minor ON profiles;
CREATE TRIGGER profiles_sync_is_minor
  BEFORE INSERT OR UPDATE OF birth_date ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_is_minor();

-- Households
CREATE TABLE IF NOT EXISTS households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  discount_percent numeric(5,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER households_updated_at
  BEFORE UPDATE ON households FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_households"
  ON households FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE TABLE IF NOT EXISTS household_members (
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (household_id, profile_id)
);

ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_household_members"
  ON household_members FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE INDEX IF NOT EXISTS idx_household_members_profile ON household_members(profile_id);

-- Guardians
CREATE TABLE IF NOT EXISTS guardians (
  guardian_id text REFERENCES profiles(id) ON DELETE CASCADE,
  child_id text REFERENCES profiles(id) ON DELETE CASCADE,
  relationship text,
  is_primary_contact boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (guardian_id, child_id),
  CHECK (guardian_id <> child_id)
);

ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_guardians"
  ON guardians FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE INDEX IF NOT EXISTS idx_guardians_child ON guardians(child_id);

-- Roles catalogue
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  persona persona_type NOT NULL,
  description text,
  permissions jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

CREATE TRIGGER roles_updated_at
  BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_roles"
  ON roles FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE INDEX IF NOT EXISTS idx_roles_organization ON roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_roles_persona ON roles(persona);

-- Member roles (person ↔ role, time-limited)
CREATE TABLE IF NOT EXISTS member_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date,
  assigned_by text REFERENCES profiles(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (valid_until IS NULL OR valid_until > valid_from)
);

CREATE TRIGGER member_roles_updated_at
  BEFORE UPDATE ON member_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE member_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_member_roles"
  ON member_roles FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE INDEX IF NOT EXISTS idx_member_roles_profile ON member_roles(profile_id);
CREATE INDEX IF NOT EXISTS idx_member_roles_role ON member_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_member_roles_organization ON member_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_member_roles_valid_until ON member_roles(valid_until);

-- Add organization_id to membership_fees
ALTER TABLE membership_fees
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_membership_fees_organization ON membership_fees(organization_id);
