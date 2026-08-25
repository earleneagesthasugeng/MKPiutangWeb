import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { serializeDebt, serializePayment, debtInclude } from "@/lib/debt-dto";
import { AppError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    const { id } = await params;

    const debt = await prisma.debt.findUnique({
      where: { id },
      include: debtInclude,
    });
    if (!debt) {
      throw new AppError("Piutang tidak ditemukan.", 404);
    }

    const payments = await prisma.payment.findMany({
      where: { debtId: id },
      orderBy: { paidAt: "desc" },
    });

    return NextResponse.json({
      debt: serializeDebt(debt),
      payments: payments.map(serializePayment),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
