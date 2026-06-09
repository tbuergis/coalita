"use server";

import { redirect } from "next/navigation";
import { createMember, addGuardianRelation } from "./members";
import { createZitadelUser } from "./zitadel";
import { buildUsername } from "./username";
import type { Member } from "@coalita/db";

export async function registerMember(formData: FormData): Promise<void> {
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const email = formData.get("email") as string;
  const birthDate = (formData.get("birth_date") as string) || undefined;
  const isGuardian = formData.get("persona") === "guardian";

  // Server-side age check
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

  // Create Zitadel user and send invite email
  const username = buildUsername(firstName, lastName);
  const usernameFallback = buildUsername(firstName, lastName, Math.random().toString(36).slice(2, 6));

  let zitadelId: string;
  try {
    zitadelId = await createZitadelUser({
      username,
      firstName,
      lastName,
      email,
      sendInvite: true,
      canLogin: true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("409") || msg.includes("already exists")) {
      zitadelId = await createZitadelUser({
        username: usernameFallback,
        firstName,
        lastName,
        email,
        sendInvite: true,
        canLogin: true,
      });
    } else throw e;
  }

  await createMember({
    id: zitadelId,
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
    redirect(`/register/children?guardian=${zitadelId}`);
  } else {
    redirect("/register/success");
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
