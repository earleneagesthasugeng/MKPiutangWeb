import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { handleApiError } from "@/lib/api-error";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { username: body.username },
    });

    const passwordMatches = user
      ? await bcrypt.compare(body.password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      throw new AppError("Username atau password salah.", 401);
    }

    const token = await createSessionToken({
      sub: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    });

    const response = NextResponse.json({
      user: {
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
