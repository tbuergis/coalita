"use server";

import { redirect } from "next/navigation";
import { getDb } from "./db";
import { createZitadelUser, lockZitadelUser, unlockZitadelUser } from "./zitadel";
import { type Member, type MembershipFee, type Guardian, type Role, type MemberRole } from "@coalita/db";

const ORG_ID = process.env.ORGANIZATION_ID ?? null;

export async function getMembers(): Promise<Member[]> {
  const db = getDb();
  const result = await db.query<Member>(
    `SELECT * FROM profiles ORDER BY membership_number ASC`
  );
  return result.rows;
}

export async function getMember(id: string): Promise<Member | null> {
  const db = getDb();
  const result = await db.query<Member>(
    `SELECT * FROM profiles WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getMemberFees(memberId: string): Promise<MembershipFee[]> {
  const db = getDb();
  const result = await db.query<MembershipFee>(
    `SELECT * FROM membership_fees WHERE member_id = $1 ORDER BY due_date DESC`,
    [memberId]
  );
  return result.rows;
}

export async function getAdultMembers(): Promise<Pick<Member, "id" | "first_name" | "last_name" | "email">[]> {
  const db = getDb();
  const result = await db.query<Pick<Member, "id" | "first_name" | "last_name" | "email">>(
    `SELECT id, first_name, last_name, email FROM profiles
     WHERE is_minor = false AND status != 'resigned'
     ORDER BY last_name, first_name`
  );
  return result.rows;
}

export async function getChildrenOf(guardianId: string): Promise<Member[]> {
  const db = getDb();
  const result = await db.query<Member>(
    `SELECT p.* FROM profiles p
     JOIN guardians g ON g.child_id = p.id
     WHERE g.guardian_id = $1
     ORDER BY p.last_name, p.first_name`,
    [guardianId]
  );
  return result.rows;
}

export async function getMemberRoles(memberId: string): Promise<(MemberRole & { role_name: string; persona: string })[]> {
  const db = getDb();
  const result = await db.query<MemberRole & { role_name: string; persona: string }>(
    `SELECT mr.*, r.name AS role_name, r.persona
     FROM member_roles mr
     JOIN roles r ON r.id = mr.role_id
     WHERE mr.profile_id = $1
     ORDER BY mr.valid_from DESC`,
    [memberId]
  );
  return result.rows;
}

export async function getOrgRoles(): Promise<Role[]> {
  const db = getDb();
  const result = await db.query<Role>(
    `SELECT * FROM roles WHERE organization_id = $1 ORDER BY persona, name`,
    [ORG_ID]
  );
  return result.rows;
}

export async function createMember(
  data: Pick<Member, "id" | "first_name" | "last_name" | "email"> &
    Partial<Omit<Member, "id" | "first_name" | "last_name" | "email" | "membership_number" | "created_at" | "updated_at">>
): Promise<Member> {
  const db = getDb();
  const result = await db.query<Member>(
    `INSERT INTO profiles (id, organization_id, first_name, last_name, email, phone, birth_date, address, joined_at, status, avatar_url, notes, can_login)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, CURRENT_DATE), COALESCE($10::member_status, 'active'), $11, $12, COALESCE($13, true))
     RETURNING *`,
    [
      data.id,
      data.organization_id ?? ORG_ID,
      data.first_name,
      data.last_name,
      data.email,
      data.phone ?? null,
      data.birth_date ?? null,
      data.address ? JSON.stringify(data.address) : null,
      data.joined_at ?? null,
      data.status ?? null,
      data.avatar_url ?? null,
      data.notes ?? null,
      data.can_login ?? true,
    ]
  );
  return result.rows[0];
}

export async function addGuardianRelation(
  guardianId: string,
  childId: string,
  relationship: string,
  isPrimaryContact: boolean
): Promise<void> {
  const db = getDb();
  await db.query(
    `INSERT INTO guardians (guardian_id, child_id, relationship, is_primary_contact)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (guardian_id, child_id) DO UPDATE
       SET relationship = EXCLUDED.relationship,
           is_primary_contact = EXCLUDED.is_primary_contact`,
    [guardianId, childId, relationship, isPrimaryContact]
  );
}

export async function assignRole(
  profileId: string,
  roleId: string,
  validFrom: string,
  validUntil?: string
): Promise<void> {
  const db = getDb();
  await db.query(
    `INSERT INTO member_roles (id, profile_id, role_id, organization_id, valid_from, valid_until)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
    [profileId, roleId, ORG_ID, validFrom, validUntil ?? null]
  );
}

export async function setMemberCanLogin(memberId: string, canLogin: boolean): Promise<void> {
  const db = getDb();
  await db.query(`UPDATE profiles SET can_login = $1 WHERE id = $2`, [canLogin, memberId]);
  if (canLogin) {
    await unlockZitadelUser(memberId);
  } else {
    await lockZitadelUser(memberId);
  }
}

export async function createMemberFromForm(formData: FormData): Promise<void> {
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const email = formData.get("email") as string;
  const birthDate = (formData.get("birth_date") as string) || undefined;
  const guardianId = (formData.get("guardian_id") as string) || null;
  const relationship = (formData.get("relationship") as string) || "Erziehungsberechtigte/r";
  const canLoginRaw = formData.get("can_login") as string | null;
  const sendInvite = formData.get("send_invite") === "1";

  // Determine if minor from birth date
  let isMinor = false;
  if (birthDate) {
    const dob = new Date(birthDate);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    isMinor = dob > cutoff;
  }

  // Server-side guard: minor without guardian
  if (isMinor && !guardianId) {
    throw new Error("Jugendmitglieder benötigen einen Erziehungsberechtigten.");
  }

  const canLogin = isMinor ? canLoginRaw === "1" : true;

  const street = formData.get("street") as string | null;
  const zip = formData.get("zip") as string | null;
  const city = formData.get("city") as string | null;
  const country = formData.get("country") as string | null;
  const address =
    street && zip && city
      ? { street, zip, city, country: country || "CH" }
      : undefined;

  // For minors without an email, use a non-deliverable placeholder
  const effectiveEmail = email?.trim()
    ? email.trim()
    : `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}@noemail.coalita.local`;

  // Create Zitadel user first to get the ID
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}`;
  const zitadelId = await createZitadelUser({
    username,
    firstName,
    lastName,
    email: effectiveEmail,
    emailVerified: false,
    sendInvite: sendInvite && canLogin && !!email?.trim(),
    canLogin,
  });

  const member = await createMember({
    id: zitadelId,
    email: effectiveEmail,
    first_name: firstName,
    last_name: lastName,
    email,
    phone: (formData.get("phone") as string) || undefined,
    birth_date: birthDate,
    status: (formData.get("status") as Member["status"]) || "active",
    address,
    notes: (formData.get("notes") as string) || undefined,
    can_login: canLogin,
  });

  if (isMinor && guardianId) {
    await addGuardianRelation(guardianId, member.id, relationship, true);
  }

  redirect(`/members/${member.id}`);
}

export async function updateMember(
  id: string,
  data: Partial<Pick<Member, "first_name" | "last_name" | "email" | "phone" | "birth_date" | "address" | "status" | "avatar_url" | "notes">>
): Promise<Member | null> {
  const db = getDb();
  const fields = Object.entries(data)
    .filter(([, v]) => v !== undefined)
    .map(([k], i) => `${k} = $${i + 2}`);

  if (fields.length === 0) return getMember(id);

  const values = Object.values(data).filter((v) => v !== undefined);
  const result = await db.query<Member>(
    `UPDATE profiles SET ${fields.join(", ")} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return result.rows[0] ?? null;
}
