import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { customerInputSchema } from "@/lib/validation/customer";
import { toNumber } from "@/lib/serialize";
import { formatCustomerId, parseCustomerIdInput } from "@/lib/format";
import { AppError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    await requireSession();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 5);

    const maybeId = parseCustomerIdInput(search);
    // MySQL default collation (utf8mb4_unicode_ci) is already case-insensitive,
    // unlike Postgres, so no `mode: "insensitive"` option is needed/available here.
    const where = search
      ? {
          OR: [
            { fullName: { contains: search } },
            ...(maybeId ? [{ id: maybeId }] : []),
          ],
        }
      : {};

    const [customers, total, unpaidAgg, paidAgg] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { fullName: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
      prisma.debt.aggregate({
        where: { status: { in: ["UNPAID", "PARTIAL"] } },
        _sum: { amount: true, amountPaid: true },
      }),
      prisma.debt.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
    ]);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const enrichedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const [outstandingAgg, overdueCount] = await Promise.all([
          prisma.debt.aggregate({
            where: { customerId: customer.id, status: { in: ["UNPAID", "PARTIAL"] } },
            _sum: { amount: true, amountPaid: true },
          }),
          prisma.debt.count({
            where: {
              customerId: customer.id,
              status: { in: ["UNPAID", "PARTIAL"] },
              dueDate: { lt: today },
            },
          }),
        ]);

        const outstanding =
          toNumber(outstandingAgg._sum.amount ?? 0) - toNumber(outstandingAgg._sum.amountPaid ?? 0);

        return {
          id: customer.id,
          idFormatted: formatCustomerId(customer.id),
          fullName: customer.fullName,
          businessName: customer.businessName,
          address: customer.address,
          phone: customer.phone,
          outstandingAmount: outstanding,
          overdueCount,
        };
      })
    );

    const totalUnpaidOutstanding =
      toNumber(unpaidAgg._sum.amount ?? 0) - toNumber(unpaidAgg._sum.amountPaid ?? 0);
    const totalPaid = toNumber(paidAgg._sum.amount ?? 0);

    return NextResponse.json({
      customers: enrichedCustomers,
      total,
      page,
      pageSize,
      summary: {
        totalUnpaidOutstanding,
        totalPaid,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSession();

    const body = customerInputSchema.parse(await request.json());

    const existing = await prisma.customer.findFirst({
      where: { fullName: { equals: body.fullName } },
    });
    if (existing) {
      throw new AppError("Nama pelanggan sudah dipakai, gunakan nama lain.", 409);
    }

    const customer = await prisma.customer.create({ data: body });

    return NextResponse.json(
      {
        customer: {
          id: customer.id,
          idFormatted: formatCustomerId(customer.id),
          fullName: customer.fullName,
          businessName: customer.businessName,
          address: customer.address,
          phone: customer.phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
