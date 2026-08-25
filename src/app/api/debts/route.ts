import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { createDebtSchema } from "@/lib/validation/debt";
import { serializeDebt, debtInclude } from "@/lib/debt-dto";
import { parseCustomerIdInput } from "@/lib/format";
import { startOfTodayUTC } from "@/lib/serialize";
import { AppError } from "@/lib/errors";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireSession();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const statusGroup = searchParams.get("statusGroup");
    const status = searchParams.get("status");
    const overdueOnly = searchParams.get("overdueOnly") === "true";
    const customerIdParam = searchParams.get("customerId");
    const sort = searchParams.get("sort") ?? "date_desc";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 8);

    const where: Prisma.DebtWhereInput = {};

    if (customerIdParam) {
      const customerId = Number(customerIdParam);
      if (Number.isInteger(customerId) && customerId > 0) {
        where.customerId = customerId;
      }
    }

    if (overdueOnly) {
      where.status = { in: ["UNPAID", "PARTIAL"] };
      where.dueDate = { lt: startOfTodayUTC() };
    } else if (status === "UNPAID" || status === "PARTIAL" || status === "PAID") {
      where.status = status;
    } else if (statusGroup === "LUNAS") {
      where.status = "PAID";
    } else {
      where.status = { in: ["UNPAID", "PARTIAL"] };
    }

    if (search) {
      const maybeId = parseCustomerIdInput(search);
      where.customer = {
        OR: [
          { fullName: { contains: search } },
          ...(maybeId ? [{ id: maybeId }] : []),
        ],
      };
    }

    let orderBy: Prisma.DebtOrderByWithRelationInput = { dueDate: "desc" };
    if (sort === "date_asc") orderBy = { dueDate: "asc" };
    else if (sort === "name_asc") orderBy = { customer: { fullName: "asc" } };

    const [debts, total] = await Promise.all([
      prisma.debt.findMany({
        where,
        orderBy,
        include: debtInclude,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.debt.count({ where }),
    ]);

    return NextResponse.json({
      debts: debts.map(serializeDebt),
      total,
      page,
      pageSize,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = createDebtSchema.parse(await request.json());

    const customer = await prisma.customer.findUnique({ where: { id: body.customerId } });
    if (!customer) {
      throw new AppError("Pelanggan tidak ditemukan.", 404);
    }

    const dueDate = new Date(body.dueDate);
    if (Number.isNaN(dueDate.getTime())) {
      throw new AppError("Tanggal jatuh tempo tidak valid.", 400);
    }
    if (dueDate < startOfTodayUTC()) {
      throw new AppError("Tanggal jatuh tempo tidak boleh sebelum hari ini.", 422);
    }

    const debt = await prisma.debt.create({
      data: {
        customerId: body.customerId,
        amount: body.amount,
        dueDate,
        createdById: session.sub,
      },
      include: debtInclude,
    });

    return NextResponse.json({ debt: serializeDebt(debt) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
