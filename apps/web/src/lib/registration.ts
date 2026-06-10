"use server";

import { redirect } from "next/navigation";
import { createMember, addGuardianRelation } from "./members";
import { createZitadelUser, updateZitadelEmail, updateZitadelProfile, findZitadelUserByEmail } from "./zitadel";
import { buildUsername } from "./username";
import { getCurrentUserId } from "./session";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import type { Member } from "@coalita/db";

export async function registerMember(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  const persona = formData.get("persona") as string;

  // Check if email already exists in Zitadel
  const existing = await findZitadelUserByEmail(email);
  if (existing) redirect("/login?error=EmailAlreadyExists");

  const localPart = email.split("@")[0];
  const username = buildUsername(localPart, "");
  const usernameFallback = buildUsername(localPart, Math.random().toString(36).slice(2, 6));

  try {
    await createZitadelUser({ username, firstName: localPart, lastName: "-", email, sendInvite: true, canLogin: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("409") || msg.includes("already exists")) {
      await createZitadelUser({ username: usernameFallback, firstName: localPart, lastName: "-", email, sendInvite: true, canLogin: true });
    } else throw e;
  }

  redirect(`/register/success?persona=${persona}`);
}

export async function completeRegistration(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const session = await getServerSession(authOptions);
  const sessionEmail = (session?.user as { email?: string })?.email ?? "";
  const sessionName = (session?.user as { name?: string })?.name ?? "";

  const persona = formData.get("persona") as string;
  const isGuardian = persona === "guardian";

  const firstName = (formData.get("first_name") as string) || sessionName.split(" ")[0] || "";
  const lastName = (formData.get("last_name") as string) || sessionName.split(" ").slice(1).join(" ") || "";
  const birthDate = (formData.get("birth_date") as string) || undefined;

  if (!isGuardian && birthDate) {
    const dob = new Date(birthDate);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    if (dob > cutoff) {
      throw new Error("Mindestalter 18 Jahre nicht erreicht.");
    }
  }

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
    email: sessionEmail,
    phone: (formData.get("phone") as string) || undefined,
    birth_date: birthDate,
    status: "active" as Member["status"],
    address,
    can_login: true,
  });

  // Sync name and verified email to Zitadel
  try { await updateZitadelProfile(userId, firstName, lastName); } catch { /* ignore */ }
  if (sessionEmail) {
    try { await updateZitadelEmail(userId, sessionEmail); } catch { /* ignore */ }
  }

  if (isGuardian) {
    redirect(`/register/children?guardian=${userId}`);
  } else {
    redirect("/members");
  }
}

export async function registerChild(formData: FormData): Promise<void> {
  const guardianId = formData.get("guardian_id") as string;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const birthDate = (formData.get("birth_date") as string) || undefined;
  const relationship = (formData.get("relationship") as string) || "Erziehungsberechtigte/r";
  const emailRaw = (formData.get("email") as string)?.trim() || null;
  const canLogin = formData.get("can_login") === "1";

  const uid = Math.random().toString(36).slice(2, 10);
  const effectiveEmail = emailRaw
    ?? `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${uid}@noemail.coalita.local`;

  const username = buildUsername(firstName, lastName);
  const usernameFallback = buildUsername(firstName, lastName, Math.random().toString(36).slice(2, 6));

  let zitadelId: string;
  try {
    zitadelId = await createZitadelUser({
      username,
      firstName,
      lastName,
      email: effectiveEmail,
      sendInvite: canLogin && !!emailRaw,
      canLogin,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("409") || msg.includes("already exists")) {
      zitadelId = await createZitadelUser({
        username: usernameFallback,
        firstName,
        lastName,
        email: effectiveEmail,
        sendInvite: canLogin && !!emailRaw,
        canLogin,
      });
    } else throw e;
  }

  const child = await createMember({
    id: zitadelId,
    first_name: firstName,
    last_name: lastName,
    email: effectiveEmail,
    birth_date: birthDate,
    status: "active" as Member["status"],
    can_login: canLogin,
  });

  await addGuardianRelation(guardianId, child.id, relationship, true);

  const addAnother = formData.get("add_another") === "1";
  if (addAnother) {
    redirect(`/register/children?guardian=${guardianId}&added=1`);
  } else {
    redirect("/register/success");
  }
}
