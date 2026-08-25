import { StatusBadge } from "@/components/ui/StatusBadge";
import { displayDebtAmount, formatDate, formatRupiah } from "@/lib/format";
import type { DebtDTO } from "@/lib/types";

export function DebtCard({ debt, onClick }: { debt: DebtDTO; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-maroon-900">{debt.customerName}</p>
          <p className="text-xs text-neutral-400">id {debt.customerIdFormatted}</p>
        </div>
      </div>
      <p className="text-lg font-bold text-maroon-900">{formatRupiah(displayDebtAmount(debt))}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-neutral-500">
          Due date {formatDate(debt.dueDate)}
          {debt.isOverdue && <span className="ml-1 font-semibold text-status-overdue">!</span>}
        </p>
        <StatusBadge status={debt.status} />
      </div>
    </button>
  );
}
