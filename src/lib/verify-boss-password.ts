import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { SessionPayload } from "@/lib/session";

export async function verifyActingBossPassword(session: SessionPayload, password: string) {
  const actingBoss = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!actingBoss) {
    throw new AppError("Sesi tidak valid, silakan login ulang.", 401);
  }
  const matches = await bcrypt.compare(password, actingBoss.passwordHash);
  if (!matches) {
    throw new AppError("Password anda salah. Perubahan dibatalkan.", 401);
  }
  return actingBoss;
}
