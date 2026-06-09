"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getMember } from "./members";

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

export async function requireProfile(): Promise<{ userId: string; hasProfile: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) return { userId: "", hasProfile: false };
  const profile = await getMember(userId);
  return { userId, hasProfile: !!profile };
}
