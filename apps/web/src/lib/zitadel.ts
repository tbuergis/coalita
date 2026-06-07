"use server";

const ISSUER = process.env.ZITADEL_ISSUER!;
const PAT = process.env.ZITADEL_SERVICE_ACCOUNT_TOKEN!;

interface CreateHumanUserParams {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified?: boolean;
  sendInvite?: boolean;   // sends welcome e-mail with login link
  canLogin?: boolean;     // false = account is locked (no self-service login)
}

interface ZitadelUserResponse {
  userId: string;
}

export async function createZitadelUser(params: CreateHumanUserParams): Promise<string> {
  const body: Record<string, unknown> = {
    username: params.username,
    profile: {
      givenName: params.firstName,
      familyName: params.lastName,
    },
    email: {
      email: params.email,
      isVerified: params.emailVerified ?? false,
      ...(params.sendInvite ? { sendCode: {} } : {}),
    },
  };

  const resp = await fetch(`${ISSUER}/v2/users/human`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PAT}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Zitadel user creation failed (${resp.status}): ${text}`);
  }

  const data = (await resp.json()) as ZitadelUserResponse;

  // Lock account if the child should not be able to log in independently
  if (params.canLogin === false) {
    await lockZitadelUser(data.userId);
  }

  return data.userId;
}

export async function lockZitadelUser(userId: string): Promise<void> {
  const resp = await fetch(`${ISSUER}/v2/users/${userId}/lock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PAT}`,
    },
    body: JSON.stringify({}),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Zitadel lock failed (${resp.status}): ${text}`);
  }
}

export async function unlockZitadelUser(userId: string): Promise<void> {
  const resp = await fetch(`${ISSUER}/v2/users/${userId}/unlock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PAT}`,
    },
    body: JSON.stringify({}),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Zitadel unlock failed (${resp.status}): ${text}`);
  }
}
