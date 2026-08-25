import { z } from "zod";

export const customerInputSchema = z.object({
  fullName: z.string().trim().min(1, "Nama lengkap wajib diisi.").max(50, "Maksimal 50 karakter."),
  businessName: z.string().trim().min(1, "Instansi/toko wajib diisi.").max(50, "Maksimal 50 karakter."),
  address: z.string().trim().min(1, "Alamat wajib diisi.").max(100, "Maksimal 100 karakter."),
  phone: z.string().trim().min(1, "Nomor telepon wajib diisi.").max(20, "Maksimal 20 karakter."),
});

export type CustomerInput = z.infer<typeof customerInputSchema>;
