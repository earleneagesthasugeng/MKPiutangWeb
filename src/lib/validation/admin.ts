import { z } from "zod";

const usernameSchema = z.string().trim().min(1, "Username wajib diisi.").max(50, "Maksimal 50 karakter.");
const displayNameSchema = z.string().trim().min(1, "Nama wajib diisi.").max(50, "Maksimal 50 karakter.");
const passwordSchema = z
  .string()
  .min(6, "Password minimal 6 karakter.")
  .max(72, "Password maksimal 72 karakter.");

export const adminUserCreateSchema = z.object({
  username: usernameSchema,
  displayName: displayNameSchema,
  password: passwordSchema,
  currentBossPassword: z.string().min(1, "Password anda wajib diisi."),
});

export const adminUserUpdateSchema = z.object({
  username: usernameSchema,
  displayName: displayNameSchema,
  newPassword: z.union([passwordSchema, z.literal("")]).optional(),
  currentBossPassword: z.string().min(1, "Password anda wajib diisi."),
});

export const adminUserDeleteSchema = z.object({
  currentBossPassword: z.string().min(1, "Password anda wajib diisi."),
});
