import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(__dirname, "..", ".env") });
loadEnv({ path: path.resolve(__dirname, "..", ".env.local"), override: true });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL tidak ditemukan.");
}

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(connectionString) });

function daysAgo(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number) {
  return daysAgo(-n);
}

async function main() {
  console.log("Menghapus data pelanggan/piutang/pembayaran lama...");
  await prisma.payment.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.customer.deleteMany();

  const boss = await prisma.user.findFirst({ where: { role: "BOSS" } });
  const staff = await prisma.user.findFirst({ where: { role: "STAFF" } });
  if (!boss || !staff) {
    throw new Error("Akun boss/staff belum ada. Jalankan `npm run db:seed` dulu sebelum ini.");
  }

  const [budi, siti, andi, dewi, rudi, wawan] = await Promise.all(
    [
      { fullName: "Budi Santoso", businessName: "Toko Budi Jaya", address: "Jl. Merdeka No. 1, Jakarta", phone: "081234567890" },
      { fullName: "Siti Aminah", businessName: "Warung Siti", address: "Jl. Melati No. 5, Bandung", phone: "081298765432" },
      { fullName: "Andi Wijaya", businessName: "Toko Andi Motor", address: "Jl. Sudirman No. 10, Surabaya", phone: "082112345678" },
      { fullName: "Dewi Lestari", businessName: "Dewi Fashion", address: "Jl. Kartini No. 3, Semarang", phone: "085611122233" },
      { fullName: "Rudi Hartono", businessName: "Bengkel Rudi", address: "Jl. Gatot Subroto No. 8, Medan", phone: "087788899900" },
      { fullName: "Wawan Setiawan", businessName: "Wawan Elektronik", address: "Jl. Diponegoro No. 12, Yogyakarta", phone: "089955566677" },
    ].map((data) => prisma.customer.create({ data }))
  );

  // Budi: 1 UNPAID belum jatuh tempo, 1 UNPAID lewat tenggat, 1 PARTIAL (2x cicilan), 1 PAID
  await prisma.debt.create({
    data: { customerId: budi.id, amount: 500000, dueDate: daysFromNow(20), status: "UNPAID", createdById: staff.id, createdAt: daysAgo(5) },
  });
  await prisma.debt.create({
    data: { customerId: budi.id, amount: 750000, dueDate: daysAgo(10), status: "UNPAID", createdById: staff.id, createdAt: daysAgo(40) },
  });
  const budiPartial = await prisma.debt.create({
    data: { customerId: budi.id, amount: 900000, amountPaid: 500000, dueDate: daysFromNow(15), status: "PARTIAL", createdById: boss.id, createdAt: daysAgo(25) },
  });
  await prisma.payment.create({ data: { debtId: budiPartial.id, amount: 300000, method: "CASH", paidAt: daysAgo(15) } });
  await prisma.payment.create({ data: { debtId: budiPartial.id, amount: 200000, method: "TRANSFER_MANDIRI", paidAt: daysAgo(5) } });

  const budiPaid = await prisma.debt.create({
    data: { customerId: budi.id, amount: 1200000, amountPaid: 1200000, dueDate: daysAgo(2), status: "PAID", paidAt: daysAgo(3), createdById: staff.id, createdAt: daysAgo(30) },
  });
  await prisma.payment.create({ data: { debtId: budiPaid.id, amount: 1200000, method: "TRANSFER_BCA", paidAt: daysAgo(3) } });

  // Siti: PARTIAL lewat tenggat (dengan catatan "Lainnya"), PAID (cash), UNPAID
  const sitiPartial = await prisma.debt.create({
    data: { customerId: siti.id, amount: 600000, amountPaid: 250000, dueDate: daysAgo(5), status: "PARTIAL", createdById: staff.id, createdAt: daysAgo(35) },
  });
  await prisma.payment.create({
    data: { debtId: sitiPartial.id, amount: 250000, method: "OTHER", note: "Bayar via titip ke tetangga toko sebelah", paidAt: daysAgo(20) },
  });

  const sitiPaid = await prisma.debt.create({
    data: { customerId: siti.id, amount: 300000, amountPaid: 300000, dueDate: daysAgo(20), status: "PAID", paidAt: daysAgo(22), createdById: boss.id, createdAt: daysAgo(45) },
  });
  await prisma.payment.create({ data: { debtId: sitiPaid.id, amount: 300000, method: "CASH", paidAt: daysAgo(22) } });

  await prisma.debt.create({
    data: { customerId: siti.id, amount: 150000, dueDate: daysFromNow(10), status: "UNPAID", createdById: staff.id, createdAt: daysAgo(2) },
  });

  // Andi: 1 UNPAID belum jatuh tempo, 1 UNPAID lewat tenggat
  await prisma.debt.create({
    data: { customerId: andi.id, amount: 2000000, dueDate: daysFromNow(30), status: "UNPAID", createdById: boss.id, createdAt: daysAgo(1) },
  });
  await prisma.debt.create({
    data: { customerId: andi.id, amount: 450000, dueDate: daysAgo(15), status: "UNPAID", createdById: staff.id, createdAt: daysAgo(50) },
  });

  // Dewi: semua sudah lunas -> contoh pelanggan yang BISA dihapus
  const dewiPaid = await prisma.debt.create({
    data: { customerId: dewi.id, amount: 800000, amountPaid: 800000, dueDate: daysAgo(10), status: "PAID", paidAt: daysAgo(12), createdById: staff.id, createdAt: daysAgo(60) },
  });
  await prisma.payment.create({ data: { debtId: dewiPaid.id, amount: 800000, method: "TRANSFER_BCA", paidAt: daysAgo(12) } });

  // Rudi: UNPAID lewat tenggat
  await prisma.debt.create({
    data: { customerId: rudi.id, amount: 350000, dueDate: daysAgo(3), status: "UNPAID", createdById: staff.id, createdAt: daysAgo(35) },
  });

  // Wawan: 2 UNPAID biasa (dorong total belum-lunas > 8 supaya pagination kelihatan)
  await prisma.debt.create({
    data: { customerId: wawan.id, amount: 275000, dueDate: daysFromNow(12), status: "UNPAID", createdById: staff.id, createdAt: daysAgo(3) },
  });
  await prisma.debt.create({
    data: { customerId: wawan.id, amount: 620000, dueDate: daysFromNow(25), status: "UNPAID", createdById: boss.id, createdAt: daysAgo(1) },
  });

  console.log("Data dummy berhasil dibuat: 6 pelanggan, beberapa piutang UNPAID/PARTIAL/PAID (termasuk yang lewat tenggat & riwayat cicilan).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
