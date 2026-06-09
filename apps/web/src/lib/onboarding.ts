"use server";

import { redirect } from "next/navigation";
import { getCurrentUserId } from "./session";
import { createMember, addGuardianRelation } from "./members";
import { getDb } from "./db";
import type { Member } from "@coalita/db";

export async function onboardingCreateProfile(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const email = formData.get("email") as string;
  const birthDate = (formData.get("birth_date") as string) || undefined;
  const isGuardian = formData.get("persona") === "guardian";

  const street = formData.get("street") as string | null;
  const zip = formData.get("zip") as string | null;
  const city = formData.get("city") as string | null;
  const country = formData.get("country") as string | null;
  const address = street && zip && city
    ? { street, zip, city, country: country || "CH" }
    : undefined;

  await createMember({
    id: userId,
    first_name: firstName,
    last_name: lastName,
    email,
    phone: (formData.get("phone") as string) || undefined,
    birth_date: birthDate,
    status: "active" as Member["status"],
    address,
    can_login: true,
  });

  if (isGuardian) {
    redirect("/onboarding/children");
  } else {
    redirect("/members");
  }
}

export async function onboardingAddChild(formData: FormData): Promise<void> {
  const guardianId = await getCurrentUserId();
  if (!guardianId) redirect("/login");

  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const birthDate = (formData.get("birth_date") as string) || undefined;
  const relationship = (formData.get("relationship") as string) || "Erziehungsberechtigte/r";
  const emailRaw = (formData.get("email") as string)?.trim() || null;
  const uid = Math.random().toString(36).slice(2, 10);
  const effectiveEmail = emailRaw
    ?? `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${uid}@noemail.coalita.local`;

  // Import Zitadel utils
  const { createZitadelUser } = await import("./zitadel");
  const { buildUsername } = await import("./username");

  const username = buildUsername(firstName, lastName);
  const usernameFallback = buildUsername(firstName, lastName, Math.random().toString(36).slice(2, 6));

  let zitadelId: string;
  try {
    zitadelId = await createZitadelUser({ username, firstName, lastName, email: effectiveEmail, canLogin: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("409") || msg.includes("already exists")) {
      zitadelId = await createZitadelUser({ username: usernameFallback, firstName, lastName, email: effectiveEmail, canLogin: false });
    } else throw e;
  }

  const child = await createMember({
    id: zitadelId,
    first_name: firstName,
    last_name: lastName,
    email: effectiveEmail,
    birth_date: birthDate,
    status: "active" as Member["status"],
    can_login: false,
  });

  await addGuardianRelation(guardianId, child.id, relationship, true);

  const addAnother = formData.get("add_another") === "1";
  if (addAnother) {
    redirect("/onboarding/children?added=1");
  } else {
    redirect("/members");
  }
}

export async function getOnboardingGuardianName(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) return "";
  const db = getDb();
  const result = await db.query<{ first_name: string; last_name: string }>(
    `SELECT first_name, last_name FROM profiles WHERE id = $1`,
    [userId]
  );
  const row = result.rows[0];
  return row ? `${row.first_name} ${row.last_name}` : "";
}
