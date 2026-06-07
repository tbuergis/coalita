"use server";

import { redirect } from "next/navigation";
import { getDb } from "./db";
import { type Member, type MembershipFee } from "@coalita/db";
import { randomUUID } from "crypto";

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

export async function createMember(
  data: Pick<Member, "id" | "first_name" | "last_name" | "email"> &
    Partial<Omit<Member, "id" | "first_name" | "last_name" | "email" | "membership_number" | "created_at" | "updated_at">>
): Promise<Member> {
  const db = getDb();
  const organizationId = process.env.ORGANIZATION_ID ?? null;
  const result = await db.query<Member>(
    `INSERT INTO profiles (id, organization_id, first_name, last_name, email, phone, birth_date, address, joined_at, status, avatar_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, CURRENT_DATE), COALESCE($10, 'active'), $11)
     RETURNING *`,
    [
      data.id,
      data.organization_id ?? organizationId,
      data.first_name,
      data.last_name,
      data.email,
      data.phone ?? null,
      data.birth_date ?? null,
      data.address ? JSON.stringify(data.address) : null,
      data.joined_at ?? null,
      data.status ?? null,
      data.avatar_url ?? null,
    ]
  );
  return result.rows[0];
}

export async function createMemberFromForm(formData: FormData): Promise<void> {
  const street = formData.get("street") as string | null;
  const zip = formData.get("zip") as string | null;
  const city = formData.get("city") as string | null;
  const country = formData.get("country") as string | null;

  const address =
    street && zip && city
      ? { street, zip, city, country: country || "CH" }
      : undefined;

  const member = await createMember({
    id: randomUUID(),
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    birth_date: (formData.get("birth_date") as string) || undefined,
    status: (formData.get("status") as Member["status"]) || "active",
    address,
  });

  redirect(`/members/${member.id}`);
}

export async function updateMember(
  id: string,
  data: Partial<Pick<Member, "first_name" | "last_name" | "email" | "phone" | "birth_date" | "address" | "status" | "avatar_url">>
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
