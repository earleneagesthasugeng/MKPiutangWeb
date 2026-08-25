import type { DebtStatus } from "@/lib/types";

/**
 * Untuk piutang PARTIAL, angka yang paling relevan ditampilkan adalah sisa
 * hutangnya (bukan total awal) supaya tidak membingungkan pemakai.
 */
export function displayDebtAmount(debt: {
  status: DebtStatus;
  amount: number;
  remaining: number;
}): number {
  return debt.status === "PARTIAL" ? debt.remaining : debt.amount;
}

export function formatRupiah(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export function formatCustomerId(id: number): string {
  return String(id).padStart(4, "0");
}

export function parseCustomerIdInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}
