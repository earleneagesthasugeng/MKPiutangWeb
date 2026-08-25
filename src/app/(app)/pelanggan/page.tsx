"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Users as UsersIcon } from "lucide-react";
import { usePageTitle } from "@/components/layout/PageTitleContext";
import { useCustomers } from "@/hooks/useCustomers";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { formatRupiah } from "@/lib/format";

export default function PelangganPage() {
  usePageTitle("Pelanggan");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { customers, totalPages, summary, loading, error } = useCustomers({
    search,
    page,
    pageSize: 5,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-[7.5rem] z-10 flex flex-col gap-3 border-b border-neutral-200 bg-cream px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Cari nama / id pelanggan"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Link
            href="/pelanggan/baru"
            aria-label="Tambah pelanggan baru"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-maroon-700 text-white hover:bg-maroon-800"
          >
            <UserPlus size={18} />
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <UsersIcon size={14} /> Total Semua Pelanggan
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-status-unpaid-bg px-3 py-2 text-center">
            <p className="text-[11px] font-medium text-status-unpaid">Piutang Unpaid</p>
            <p className="text-sm font-bold text-status-unpaid">
              {formatRupiah(summary.totalUnpaidOutstanding)}
            </p>
          </div>
          <div className="rounded-xl bg-status-paid-bg px-3 py-2 text-center">
            <p className="text-[11px] font-medium text-status-paid">Piutang Paid</p>
            <p className="text-sm font-bold text-status-paid">{formatRupiah(summary.totalPaid)}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-200" />
          ))}
        </div>
      ) : error ? (
        <p className="p-6 text-center text-sm font-medium text-status-unpaid">{error}</p>
      ) : customers.length === 0 ? (
        <p className="p-12 text-center text-sm font-medium text-neutral-400">
          Belum ada pelanggan.
        </p>
      ) : (
        <div className="flex flex-col gap-3 p-4">
          {customers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
