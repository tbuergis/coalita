"use server";

const ISSUER = process.env.ZITADEL_ISSUER!;
const PAT = process.env.ZITADEL_SERVICE_ACCOUNT_TOKEN!;

// Zitadel Cloud: API endpoint is the instance domain, custom domain sent as header
const ZITADEL_API = process.env.ZITADEL_API_URL ?? ISSUER;
const ZITADEL_DOMAIN = new URL(ISSUER).hostname;

function zitadelHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${PAT}`,
    "x-zitadel-domain": ZITADEL_DOMAIN,
  };
}

function toAsciiSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/à|á|â/g, "a").replace(/è|é|ê/g, "e")
    .replace(/[^a-z0-9]/g, "");
}

export function buildUsername(firstName: string, lastName: string, suffix?: string): string {
  const base = `${toAsciiSlug(firstName)}.${toAsciiSlug(lastName)}`;
  return suffix ? `${base}.${suffix}` : base;
}
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
      ...(params.sendInvite
        ? { sendCode: {} }
        : { isVerified: false }
      ),
    },
  };

  const resp = await fetch(`${ZITADEL_API}/v2/users/human`, {
    method: "POST",
    headers: zitadelHeaders(),
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
  const resp = await fetch(`${ZITADEL_API}/v2/users/${userId}/lock`, {
    method: "POST",
    headers: zitadelHeaders(),
    body: JSON.stringify({}),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Zitadel lock failed (${resp.status}): ${text}`);
  }
}

export async function unlockZitadelUser(userId: string): Promise<void> {
  const resp = await fetch(`${ZITADEL_API}/v2/users/${userId}/unlock`, {
    method: "POST",
    headers: zitadelHeaders(),
    body: JSON.stringify({}),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Zitadel unlock failed (${resp.status}): ${text}`);
  }
}
