import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "piutang_session";
const SESSION_DURATION = "12h";

export type SessionPayload = {
  sub: string;
  username: string;
  displayName: string;
  role: "BOSS" | "STAFF";
};

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET belum diset atau terlalu pendek (minimal 16 karakter)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.sub === "string" &&
      typeof payload.username === "string" &&
      typeof payload.displayName === "string" &&
      (payload.role === "BOSS" || payload.role === "STAFF")
    ) {
      return {
        sub: payload.sub,
        username: payload.username,
        displayName: payload.displayName,
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}
