import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireBoss } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { adminUserUpdateSchema, adminUserDeleteSchema } from "@/lib/validation/admin";
import { verifyActingBossPassword } from "@/lib/verify-boss-password";
import { AppError } from "@/lib/errors";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireBoss();
    const { id } = await params;
    const body = adminUserUpdateSchema.parse(await request.json());

    await verifyActingBossPassword(session, body.currentBossPassword);

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      throw new AppError("Akun tidak ditemukan.", 404);
    }
    if (target.role === "BOSS" && target.id !== session.sub) {
      throw new AppError("Tidak bisa mengubah akun boss lain.", 403);
    }

    const usernameTaken = await prisma.user.findFirst({
      where: { username: body.username, id: { not: id } },
    });
    if (usernameTaken) {
      throw new AppError("Username sudah dipakai.", 409);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        username: body.username,
        displayName: body.displayName,
        ...(body.newPassword
          ? { passwordHash: await bcrypt.hash(body.newPassword, 12) }
          : {}),
      },
      select: { id: true, username: true, displayName: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireBoss();
    const { id } = await params;
    const body = adminUserDeleteSchema.parse(await request.json());

    await verifyActingBossPassword(session, body.currentBossPassword);

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      throw new AppError("Akun tidak ditemukan.", 404);
    }
    if (target.role === "BOSS") {
      throw new AppError("Akun boss tidak bisa dihapus.", 403);
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
