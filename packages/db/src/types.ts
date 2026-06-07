export enum MemberStatus {
  active = "active",
  passive = "passive",
  honorary = "honorary",
  resigned = "resigned",
}

export interface Address {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface Member {
  id: string;
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
  created_at: string;
  updated_at: string;
}

export interface MembershipFee {
  id: string;
  member_id: string;
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
