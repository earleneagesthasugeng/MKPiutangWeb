import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function resolveConnectionString() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL tidak ditemukan. Set environment variable DATABASE_URL ke connection string MySQL anda."
    );
  }

  return url;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaMariaDb(resolveConnectionString()) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
