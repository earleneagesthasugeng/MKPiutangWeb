import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { customerInputSchema } from "@/lib/validation/customer";
import { toNumber, startOfTodayUTC } from "@/lib/serialize";
import { formatCustomerId } from "@/lib/format";
import { AppError } from "@/lib/errors";

async function parseId(params: Promise<{ id: string }>) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new AppError("ID pelanggan tidak valid.", 400);
  }
  return numericId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    const id = await parseId(params);

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new AppError("Pelanggan tidak ditemukan.", 404);
    }

    const today = startOfTodayUTC();
    const [unpaidAgg, paidAgg, overdueCount, unpaidCount] = await Promise.all([
      prisma.debt.aggregate({
        where: { customerId: id, status: { in: ["UNPAID", "PARTIAL"] } },
        _sum: { amount: true, amountPaid: true },
      }),
      prisma.debt.aggregate({
        where: { customerId: id, status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.debt.count({
        where: {
          customerId: id,
          status: { in: ["UNPAID", "PARTIAL"] },
          dueDate: { lt: today },
        },
      }),
      prisma.debt.count({ where: { customerId: id, status: "UNPAID" } }),
    ]);

    return NextResponse.json({
      customer: {
        id: customer.id,
        idFormatted: formatCustomerId(customer.id),
        fullName: customer.fullName,
        businessName: customer.businessName,
        address: customer.address,
        phone: customer.phone,
      },
      totalUnpaidOutstanding:
        toNumber(unpaidAgg._sum.amount ?? 0) - toNumber(unpaidAgg._sum.amountPaid ?? 0),
      totalPaid: toNumber(paidAgg._sum.amount ?? 0),
      overdueCount,
      canDelete: unpaidCount === 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    const id = await parseId(params);
    const body = customerInputSchema.parse(await request.json());

    const target = await prisma.customer.findUnique({ where: { id } });
    if (!target) {
      throw new AppError("Pelanggan tidak ditemukan.", 404);
    }

    const nameTaken = await prisma.customer.findFirst({
      where: { fullName: { equals: body.fullName }, id: { not: id } },
    });
    if (nameTaken) {
      throw new AppError("Nama pelanggan sudah dipakai, gunakan nama lain.", 409);
    }

    const customer = await prisma.customer.update({ where: { id }, data: body });

    return NextResponse.json({
      customer: {
        id: customer.id,
        idFormatted: formatCustomerId(customer.id),
        fullName: customer.fullName,
        businessName: customer.businessName,
        address: customer.address,
        phone: customer.phone,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    const id = await parseId(params);

    const target = await prisma.customer.findUnique({ where: { id } });
    if (!target) {
      throw new AppError("Pelanggan tidak ditemukan.", 404);
    }

    const unpaidCount = await prisma.debt.count({
      where: { customerId: id, status: "UNPAID" },
    });
    if (unpaidCount > 0) {
      throw new AppError(
        "Pelanggan tidak bisa dihapus karena masih ada piutang berstatus UNPAID.",
        409
      );
    }

    await prisma.customer.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
