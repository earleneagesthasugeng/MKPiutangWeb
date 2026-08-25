import { z } from "zod";

export const createDebtSchema = z.object({
  customerId: z.number().int().positive("ID pelanggan tidak valid."),
  amount: z.number().positive("Jumlah hutang harus lebih dari 0."),
  dueDate: z.string().min(1, "Tanggal jatuh tempo wajib diisi."),
});

export const paymentMethodValues = [
  "TRANSFER_BCA",
  "TRANSFER_MANDIRI",
  "CASH",
  "OTHER",
] as const;

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const settleDebtSchema = z
  .object({
    decision: z.enum(["PAID", "PARTIAL"]),
    cicilan: z.number().positive().optional(),
    method: z.enum(paymentMethodValues, { message: "Metode pembayaran wajib dipilih." }),
    note: z.string().trim().max(600, "Catatan maksimal 600 karakter.").optional(),
    bossPassword: z.string().min(1, "Password wajib diisi."),
  })
  .refine((data) => !data.note || countWords(data.note) <= 100, {
    message: "Catatan maksimal 100 kata.",
    path: ["note"],
  });
