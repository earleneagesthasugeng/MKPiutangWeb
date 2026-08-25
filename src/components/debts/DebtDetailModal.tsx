"use client";

import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CustomerContactInfo } from "@/components/ui/CustomerContactInfo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { displayDebtAmount, formatDate, formatRupiah } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-method";
import type { DebtDTO, PaymentDTO } from "@/lib/types";

export function DebtDetailModal({
  debt,
  isBoss,
  onClose,
  onSettleClick,
}: {
  debt: DebtDTO;
  isBoss: boolean;
  onClose: () => void;
  onSettleClick: () => void;
}) {
  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingHistory(true);
    fetch(`/api/debts/${debt.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPayments(data.payments ?? []);
      })
      .catch(() => {
        if (!cancelled) setPayments([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debt.id]);

  return (
    <Modal
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Detail piutang ${debt.customerName}`}
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-lg font-bold text-maroon-900">{debt.customerName}</p>
          <p className="text-xs text-neutral-400">id {debt.customerIdFormatted}</p>
        </div>

        <CustomerContactInfo
          businessName={debt.customerBusinessName}
          address={debt.customerAddress}
          phone={debt.customerPhone}
        />

        <div className="flex items-center justify-between rounded-xl bg-maroon-50 px-4 py-3">
          <div>
            {debt.status === "PARTIAL" && (
              <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                Sisa Hutang
              </p>
            )}
            <p className="text-xl font-bold text-maroon-900">
              {formatRupiah(displayDebtAmount(debt))}
              {debt.status === "PARTIAL" && (
                <span className="ml-1.5 text-xs font-normal text-neutral-400">
                  dari {formatRupiah(debt.amount)}
                </span>
              )}
            </p>
            <p className="text-xs text-neutral-500">Due date {formatDate(debt.dueDate)}</p>
          </div>
          <StatusBadge status={debt.status} />
        </div>

        <div className="flex flex-col gap-1 text-xs text-neutral-400">
          <p>Pembuat: {debt.createdByDisplayName}</p>
          <p>Tanggal dibuat: {formatDate(debt.createdAt)}</p>
          {debt.paidAt && <p>Tanggal diselesaikan: {formatDate(debt.paidAt)}</p>}
        </div>

        {!loadingHistory && payments.length > 0 && (
          <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-maroon-900">
              <Receipt size={13} /> Riwayat Pembayaran
            </p>
            <div className="flex flex-col divide-y divide-neutral-100">
              {payments.map((payment) => (
                <div key={payment.id} className="flex flex-col gap-0.5 py-2 text-xs first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-maroon-900">
                      {formatRupiah(payment.amount)}
                    </span>
                    <span className="text-neutral-400">{formatDate(payment.paidAt)}</span>
                  </div>
                  <span className="text-neutral-500">{PAYMENT_METHOD_LABELS[payment.method]}</span>
                  {payment.note && <span className="text-neutral-400">Catatan: {payment.note}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {isBoss && debt.status !== "PAID" ? (
          <Button onClick={onSettleClick} className="w-full">
            SELESAIKAN
          </Button>
        ) : (
          <Button variant="outline" onClick={onClose} className="w-full">
            Tutup
          </Button>
        )}
      </div>
    </Modal>
  );
}
