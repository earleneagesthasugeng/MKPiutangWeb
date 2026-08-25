import { Inbox } from "lucide-react";
import { DebtCard } from "@/components/debts/DebtCard";
import type { DebtDTO } from "@/lib/types";

export function DebtCardGrid({
  debts,
  loading,
  error,
  onSelect,
}: {
  debts: DebtDTO[];
  loading: boolean;
  error: string | null;
  onSelect: (debt: DebtDTO) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-neutral-200" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="p-6 text-center text-sm font-medium text-status-unpaid">{error}</p>;
  }

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-12 text-neutral-400">
        <Inbox size={32} />
        <p className="text-sm font-medium">Tidak ada piutang untuk ditampilkan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
      {debts.map((debt) => (
        <DebtCard key={debt.id} debt={debt} onClick={() => onSelect(debt)} />
      ))}
    </div>
  );
}
