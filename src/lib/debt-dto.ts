import { toNumber, startOfTodayUTC } from "@/lib/serialize";
import { formatCustomerId } from "@/lib/format";
import type { DebtStatus, PaymentMethod } from "@/generated/prisma/client";

type Decimalish = { toNumber: () => number };

type DebtWithRelations = {
  id: string;
  customerId: number;
  amount: Decimalish;
  amountPaid: Decimalish;
  status: DebtStatus;
  dueDate: Date;
  paidAt: Date | null;
  createdAt: Date;
  customer: {
    fullName: string;
    businessName: string;
    address: string;
    phone: string;
  };
  createdBy: {
    displayName: string;
  };
};

export function serializeDebt(debt: DebtWithRelations) {
  const amount = toNumber(debt.amount);
  const amountPaid = toNumber(debt.amountPaid);
  const remaining = Math.max(0, Math.round((amount - amountPaid) * 100) / 100);
  const today = startOfTodayUTC();
  const isOverdue = debt.status !== "PAID" && debt.dueDate < today;

  return {
    id: debt.id,
    customerId: debt.customerId,
    customerIdFormatted: formatCustomerId(debt.customerId),
    customerName: debt.customer.fullName,
    customerBusinessName: debt.customer.businessName,
    customerAddress: debt.customer.address,
    customerPhone: debt.customer.phone,
    amount,
    amountPaid,
    remaining,
    status: debt.status,
    dueDate: debt.dueDate.toISOString(),
    createdAt: debt.createdAt.toISOString(),
    paidAt: debt.paidAt ? debt.paidAt.toISOString() : null,
    isOverdue,
    createdByDisplayName: debt.createdBy.displayName,
  };
}

export const debtInclude = {
  customer: {
    select: { fullName: true, businessName: true, address: true, phone: true },
  },
  createdBy: { select: { displayName: true } },
} as const;

type PaymentRecord = {
  id: string;
  amount: Decimalish;
  method: PaymentMethod;
  note: string | null;
  paidAt: Date;
};

export function serializePayment(payment: PaymentRecord) {
  return {
    id: payment.id,
    amount: toNumber(payment.amount),
    method: payment.method,
    note: payment.note,
    paidAt: payment.paidAt.toISOString(),
  };
}
