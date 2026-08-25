import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/lib/session";
import { AppError } from "@/lib/errors";

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export class UnauthorizedError extends AppError {
  constructor(message = "Anda belum login.") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Anda tidak punya akses untuk aksi ini.") {
    super(message, 403);
  }
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

export async function requireBoss(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "BOSS") throw new ForbiddenError();
  return session;
}
