import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireBoss } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { settleDebtSchema } from "@/lib/validation/debt";
import { serializeDebt, debtInclude } from "@/lib/debt-dto";
import { toNumber } from "@/lib/serialize";
import { AppError } from "@/lib/errors";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireBoss();
    const { id } = await params;
    const body = settleDebtSchema.parse(await request.json());

    const boss = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!boss) {
      throw new AppError("Sesi tidak valid, silakan login ulang.", 401);
    }

    const passwordMatches = await bcrypt.compare(body.bossPassword, boss.passwordHash);
    if (!passwordMatches) {
      throw new AppError("Password salah. Penyelesaian piutang dibatalkan.", 401);
    }

    const debt = await prisma.debt.findUnique({ where: { id } });
    if (!debt) {
      throw new AppError("Piutang tidak ditemukan.", 404);
    }
    if (debt.status === "PAID") {
      throw new AppError("Piutang ini sudah lunas.", 409);
    }

    const amount = toNumber(debt.amount);
    const currentPaid = toNumber(debt.amountPaid);
    const remaining = Math.round((amount - currentPaid) * 100) / 100;

    let newAmountPaid: number;
    let newStatus: "PAID" | "PARTIAL";
    let paymentAmount: number;

    if (body.decision === "PAID") {
      paymentAmount = remaining;
      newAmountPaid = amount;
      newStatus = "PAID";
    } else {
      if (!body.cicilan || body.cicilan <= 0) {
        throw new AppError("Besar cicilan wajib diisi.", 422);
      }
      if (body.cicilan > remaining) {
        throw new AppError("Besar cicilan tidak boleh melebihi sisa hutang.", 422);
      }
      paymentAmount = body.cicilan;
      const combined = Math.round((currentPaid + body.cicilan) * 100) / 100;
      if (combined >= amount) {
        newAmountPaid = amount;
        newStatus = "PAID";
      } else {
        newAmountPaid = combined;
        newStatus = "PARTIAL";
      }
    }

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          debtId: id,
          amount: paymentAmount,
          method: body.method,
          note: body.note || null,
          paidAt: now,
        },
      });

      return tx.debt.update({
        where: { id },
        data: {
          amountPaid: newAmountPaid,
          status: newStatus,
          paidAt: newStatus === "PAID" ? now : null,
        },
        include: debtInclude,
      });
    });

    return NextResponse.json({ debt: serializeDebt(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}
