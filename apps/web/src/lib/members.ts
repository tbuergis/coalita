"use server";

import { getDb } from "./db";
import { type Member, type MembershipFee } from "@coalita/db";

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
  const result = await db.query<Member>(
    `INSERT INTO profiles (id, first_name, last_name, email, phone, birth_date, address, joined_at, status, avatar_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_DATE), COALESCE($9, 'active'), $10)
     RETURNING *`,
    [
      data.id,
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
