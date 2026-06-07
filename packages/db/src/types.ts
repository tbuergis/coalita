export enum MemberStatus {
  active = "active",
  passive = "passive",
  honorary = "honorary",
  resigned = "resigned",
}

export enum PersonaType {
  vorstand = "vorstand",
  funktionaer = "funktionaer",
  mitglied = "mitglied",
  erziehungsberechtigter = "erziehungsberechtigter",
  geschaeftsstelle = "geschaeftsstelle",
}

export interface Address {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: Address;
  founded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  organization_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  address?: Address;
  joined_at: string;
  status: MemberStatus;
  membership_number: string;
  avatar_url?: string;
  is_minor: boolean;
  can_login: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  organization_id?: string;
  name: string;
  discount_percent: number;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  household_id: string;
  profile_id: string;
}

export interface Guardian {
  guardian_id: string;
  child_id: string;
  relationship?: string;
  is_primary_contact: boolean;
  created_at: string;
}

export interface Role {
  id: string;
  organization_id: string;
  name: string;
  persona: PersonaType;
  description?: string;
  permissions?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MemberRole {
  id: string;
  profile_id: string;
  role_id: string;
  organization_id: string;
  valid_from: string;
  valid_until?: string;
  assigned_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MembershipFee {
  id: string;
  member_id: string;
  organization_id?: string;
  amount: number;
  due_date: string;
  paid_at?: string;
  payment_method?: string;
  period_start?: string;
  period_end?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
