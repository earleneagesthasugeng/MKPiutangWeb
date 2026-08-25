"use client";

import { useMemo, useState } from "react";
import { usePageTitle } from "@/components/layout/PageTitleContext";
import { useSession } from "@/components/layout/SessionContext";
import { useDebts } from "@/hooks/useDebts";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { DebtCardGrid } from "@/components/debts/DebtCardGrid";
import { DebtDetailModal } from "@/components/debts/DebtDetailModal";
import { SettleDebtFlow } from "@/components/debts/SettleDebtFlow";
import { SortFilterMenu, type SortValue } from "@/components/debts/SortFilterMenu";
import type { DebtDTO } from "@/lib/types";

export default function LewatTenggatPage() {
  usePageTitle("Lewat Tenggat");
  const session = useSession();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("date_asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<DebtDTO | null>(null);
  const [settling, setSettling] = useState(false);

  const { debts, totalPages, loading, error, refetch } = useDebts(
    useMemo(
      () => ({ search, sort, overdueOnly: true, page, pageSize: 8 }),
      [search, sort, page]
    )
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-[7.5rem] z-10 flex gap-2 border-b border-neutral-200 bg-cream px-4 py-3 sm:px-6">
        <SearchInput
          placeholder="Cari nama / id pelanggan"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <SortFilterMenu value={sort} onChange={setSort} />
      </div>

      <DebtCardGrid
        debts={debts}
        loading={loading}
        error={error}
        onSelect={(debt) => {
          setSelected(debt);
          setSettling(false);
        }}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {selected && !settling && (
        <DebtDetailModal
          debt={selected}
          isBoss={session.role === "BOSS"}
          onClose={() => setSelected(null)}
          onSettleClick={() => setSettling(true)}
        />
      )}

      {selected && settling && (
        <SettleDebtFlow
          debt={selected}
          onCancel={() => {
            setSettling(false);
            setSelected(null);
          }}
          onSettled={() => refetch()}
        />
      )}
    </div>
  );
}
