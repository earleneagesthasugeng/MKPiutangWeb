import path from "node:path";
import { config as loadEnv } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// This script also runs standalone via `npm run db:seed` (tsx prisma/seed.ts),
// outside of prisma.config.ts's own env loading, so load env files here too.
loadEnv({ path: path.resolve(__dirname, "..", ".env") });
loadEnv({ path: path.resolve(__dirname, "..", ".env.local"), override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL tidak ditemukan saat menjalankan seed.");
}

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(connectionString) });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Environment variable ${name} belum diisi. Isi dulu di .env.local ` +
        "(lihat .env.example) sebelum menjalankan `npm run db:seed` — " +
        "tidak ada lagi password default di dalam source code."
    );
  }
  return value;
}

// Username & password akun awal WAJIB diisi lewat environment variable
// (tidak ada fallback ke nilai asli di source code), supaya repo ini aman
// dipush ke GitHub (bahkan kalau suatu saat public) tanpa membocorkan
// kredensial. Nama tampilan (displayName) bukan rahasia, boleh punya default.
const seedAccounts = [
  {
    role: "BOSS" as const,
    displayName: process.env.SEED_BOSS_DISPLAY_NAME ?? "Megawati",
    username: requireEnv("SEED_BOSS_USERNAME"),
    password: requireEnv("SEED_BOSS_PASSWORD"),
  },
  {
    role: "STAFF" as const,
    displayName: process.env.SEED_STAFF1_DISPLAY_NAME ?? "Laila",
    username: requireEnv("SEED_STAFF1_USERNAME"),
    password: requireEnv("SEED_STAFF1_PASSWORD"),
  },
  {
    role: "STAFF" as const,
    displayName: process.env.SEED_STAFF2_DISPLAY_NAME ?? "Putu",
    username: requireEnv("SEED_STAFF2_USERNAME"),
    password: requireEnv("SEED_STAFF2_PASSWORD"),
  },
];

async function main() {
  for (const account of seedAccounts) {
    const passwordHash = await bcrypt.hash(account.password, 12);
    await prisma.user.upsert({
      where: { username: account.username },
      update: {},
      create: {
        username: account.username,
        passwordHash,
        role: account.role,
        displayName: account.displayName,
      },
    });
    console.log(`Seeded user: ${account.username} (${account.role})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
