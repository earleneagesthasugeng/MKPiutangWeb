"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2, SlidersHorizontal, Check } from "lucide-react";
import { usePageTitle } from "@/components/layout/PageTitleContext";
import { useSession } from "@/components/layout/SessionContext";
import { useDebts } from "@/hooks/useDebts";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/Menu";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { CustomerContactInfo } from "@/components/ui/CustomerContactInfo";
import { EditCustomerModal } from "@/components/customers/EditCustomerModal";
import { DebtCardGrid } from "@/components/debts/DebtCardGrid";
import { DebtDetailModal } from "@/components/debts/DebtDetailModal";
import { SettleDebtFlow } from "@/components/debts/SettleDebtFlow";
import { formatRupiah } from "@/lib/format";
import type { CustomerDetailDTO, DebtDTO } from "@/lib/types";

type FilterValue = "ALL" | "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "PAID", label: "Paid" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "OVERDUE", label: "Lewat Tenggat" },
];

export default function DetailPelangganPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const session = useSession();
  const customerId = Number(params.id);

  const [detail, setDetail] = useState<CustomerDetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<DebtDTO | null>(null);
  const [settling, setSettling] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  usePageTitle(detail ? `Detil - ${detail.customer.fullName}` : "Detil Pelanggan");

  const loadDetail = useCallback(() => {
    setDetailLoading(true);
    setDetailError(null);
    fetch(`/api/customers/${customerId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Gagal memuat data pelanggan.");
        return data as CustomerDetailDTO;
      })
      .then(setDetail)
      .catch((err: Error) => setDetailError(err.message))
      .finally(() => setDetailLoading(false));
  }, [customerId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const debtParams = useMemo(() => {
    const base = { customerId, page, pageSize: 8 } as const;
    if (filter === "OVERDUE") return { ...base, overdueOnly: true };
    if (filter === "UNPAID" || filter === "PARTIAL" || filter === "PAID") {
      return { ...base, status: filter };
    }
    return base;
  }, [customerId, filter, page]);

  const { debts, totalPages, loading, error, refetch } = useDebts(debtParams);

  async function handleDelete() {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/customers/${customerId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setDeleteError(data.error ?? "Gagal menghapus pelanggan.");
        return;
      }
      router.push("/pelanggan");
    } catch {
      setDeleteError("Terjadi kesalahan koneksi.");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (detailLoading) {
    return <div className="p-8 text-center text-sm text-neutral-400">Memuat...</div>;
  }

  if (detailError || !detail) {
    return (
      <div className="p-8 text-center text-sm font-medium text-status-unpaid">
        {detailError ?? "Pelanggan tidak ditemukan."}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-[7.5rem] z-10 flex flex-col gap-4 border-b border-neutral-200 bg-cream px-4 py-4 sm:px-6">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-lg font-bold text-maroon-900">{detail.customer.fullName}</p>
              <p className="text-xs text-neutral-400">id {detail.customer.idFormatted}</p>
            </div>
            <Menu>
              <MenuTrigger
                aria-label="Menu pelanggan"
                className="flex h-8 w-8 items-center justify-center rounded-full text-maroon-800 hover:bg-maroon-50"
              >
                <MoreVertical size={18} />
              </MenuTrigger>
              <MenuContent>
                <MenuItem onSelect={() => setEditing(true)}>
                  <span className="flex items-center gap-2">
                    <Pencil size={14} /> Edit informasi
                  </span>
                </MenuItem>
                <MenuItem onSelect={() => setDeleting(true)}>
                  <span className="flex items-center gap-2 text-status-unpaid">
                    <Trash2 size={14} /> Hapus pelanggan
                  </span>
                </MenuItem>
              </MenuContent>
            </Menu>
          </div>

          <CustomerContactInfo
            className="mt-3"
            businessName={detail.customer.businessName}
            address={detail.customer.address}
            phone={detail.customer.phone}
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-status-unpaid-bg px-3 py-2 text-center">
              <p className="text-[11px] font-medium text-status-unpaid">Piutang Unpaid</p>
              <p className="text-sm font-bold text-status-unpaid">
                {formatRupiah(detail.totalUnpaidOutstanding)}
              </p>
            </div>
            <div className="rounded-xl bg-status-paid-bg px-3 py-2 text-center">
              <p className="text-[11px] font-medium text-status-paid">Piutang Paid</p>
              <p className="text-sm font-bold text-status-paid">
                {formatRupiah(detail.totalPaid)}
              </p>
            </div>
          </div>

          {detail.overdueCount > 0 && (
            <p className="mt-3 text-center text-xs font-semibold text-status-overdue">
              {detail.overdueCount} piutang lewat tenggat
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Menu>
            <MenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal size={14} /> Filter
              </Button>
            </MenuTrigger>
            <MenuContent>
              {FILTER_OPTIONS.map((opt) => (
                <MenuItem
                  key={opt.value}
                  onSelect={() => {
                    setFilter(opt.value);
                    setPage(1);
                  }}
                >
                  <span className="flex items-center justify-between gap-3">
                    {opt.label}
                    {filter === opt.value && <Check size={14} />}
                  </span>
                </MenuItem>
              ))}
            </MenuContent>
          </Menu>
        </div>
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
          onSettled={() => {
            refetch();
            loadDetail();
          }}
        />
      )}

      {editing && (
        <EditCustomerModal
          customer={detail.customer}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setDetail((prev) => (prev ? { ...prev, customer: updated } : prev));
          }}
        />
      )}

      {deleting && (
        <Modal
          open
          onOpenChange={(open) => !open && !deleteLoading && setDeleting(false)}
          title="Hapus pelanggan"
          showTitle
        >
          {detail.canDelete ? (
            <div className="flex flex-col gap-4">
              <p className="text-center text-sm font-medium text-neutral-600">
                Yakin ingin menghapus{" "}
                <span className="font-semibold text-maroon-900">{detail.customer.fullName}</span>?
                Semua riwayat piutang pelanggan ini akan ikut terhapus.
              </p>
              {deleteError && (
                <p className="text-center text-xs font-medium text-status-unpaid">{deleteError}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={deleteLoading}
                  onClick={() => setDeleting(false)}
                >
                  Batal
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  disabled={deleteLoading}
                  onClick={handleDelete}
                >
                  {deleteLoading ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-center text-sm font-medium text-status-unpaid">
                Pelanggan ini masih punya piutang berstatus UNPAID dan tidak bisa dihapus.
                Selesaikan dulu piutangnya sebelum menghapus.
              </p>
              <Button onClick={() => setDeleting(false)} className="w-full">
                Tutup
              </Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
