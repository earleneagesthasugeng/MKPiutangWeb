import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await requireSession();

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name")?.trim() ?? "";
    const excludeId = Number(searchParams.get("excludeId"));

    if (!name) {
      return NextResponse.json({ available: false });
    }

    const existing = await prisma.customer.findFirst({
      where: {
        fullName: { equals: name },
        ...(Number.isInteger(excludeId) && excludeId > 0
          ? { id: { not: excludeId } }
          : {}),
      },
      select: { id: true },
    });

    return NextResponse.json({ available: !existing });
  } catch (error) {
    return handleApiError(error);
  }
}
