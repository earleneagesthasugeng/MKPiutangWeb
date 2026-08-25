import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireBoss } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { adminUserCreateSchema } from "@/lib/validation/admin";
import { verifyActingBossPassword } from "@/lib/verify-boss-password";
import { AppError } from "@/lib/errors";

export async function GET() {
  try {
    await requireBoss();

    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { displayName: "asc" }],
      select: { id: true, username: true, displayName: true, role: true },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireBoss();
    const body = adminUserCreateSchema.parse(await request.json());

    await verifyActingBossPassword(session, body.currentBossPassword);

    const existing = await prisma.user.findUnique({ where: { username: body.username } });
    if (existing) {
      throw new AppError("Username sudah dipakai.", 409);
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        username: body.username,
        displayName: body.displayName,
        passwordHash,
        role: "STAFF",
      },
      select: { id: true, username: true, displayName: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
