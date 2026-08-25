import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import type { CustomerListItemDTO } from "@/lib/types";

export function CustomerCard({ customer }: { customer: CustomerListItemDTO }) {
  return (
    <Link
      href={`/pelanggan/${customer.id}`}
      className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-maroon-900">{customer.fullName}</p>
          <span className="text-xs text-neutral-400">id {customer.idFormatted}</span>
          {customer.overdueCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-status-unpaid px-1.5 text-[11px] font-bold text-white">
              {customer.overdueCount}
            </span>
          )}
        </div>
        <p className="truncate text-sm text-neutral-500">{customer.businessName}</p>
        <p className="truncate text-xs text-neutral-400">{customer.phone}</p>
        <div className="mt-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Jumlah Piutang
          </p>
          <p className="text-sm font-bold text-status-unpaid">
            {formatRupiah(customer.outstandingAmount)}
          </p>
        </div>
      </div>
      <ChevronRight className="shrink-0 text-maroon-700" size={20} />
    </Link>
  );
}
