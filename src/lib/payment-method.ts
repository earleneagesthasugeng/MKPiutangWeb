import type { PaymentMethod } from "@/generated/prisma/client";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  TRANSFER_BCA: "Transfer BCA",
  TRANSFER_MANDIRI: "Transfer Mandiri",
  CASH: "Cash",
  OTHER: "Lainnya",
};

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "TRANSFER_BCA", label: PAYMENT_METHOD_LABELS.TRANSFER_BCA },
  { value: "TRANSFER_MANDIRI", label: PAYMENT_METHOD_LABELS.TRANSFER_MANDIRI },
  { value: "CASH", label: PAYMENT_METHOD_LABELS.CASH },
  { value: "OTHER", label: PAYMENT_METHOD_LABELS.OTHER },
];
