"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/components/layout/PageTitleContext";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  addMonths,
  formatCustomerId,
  formatDate,
  formatRupiah,
  parseCustomerIdInput,
  toDateInputValue,
} from "@/lib/format";
import { CheckCircle2 } from "lucide-react";

type LookupState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "found"; name: string }
  | { status: "not-found" };

const todayValue = toDateInputValue(new Date());
const defaultDueDate = toDateInputValue(addMonths(new Date(), 1));

export default function BuatPiutangBaruPage() {
  usePageTitle("Buat Hutang Baru");

  const [customerIdInput, setCustomerIdInput] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [lookup, setLookup] = useState<LookupState>({ status: "idle" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const customerId = parseCustomerIdInput(customerIdInput);
    if (!customerId) {
      setLookup(customerIdInput.trim() ? { status: "not-found" } : { status: "idle" });
      return;
    }

    let cancelled = false;
    setLookup({ status: "checking" });
    const timer = setTimeout(() => {
      fetch(`/api/customers/${customerId}`)
        .then(async (res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          if (!cancelled) setLookup({ status: "found", name: data.customer.fullName });
        })
        .catch(() => {
          if (!cancelled) setLookup({ status: "not-found" });
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [customerIdInput]);

  const amountValue = Number(amount);
  const dueDateValid = Boolean(dueDate) && dueDate >= todayValue;
  const isFormValid = lookup.status === "found" && amountValue > 0 && dueDateValid;

  async function handleConfirmSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const customerId = parseCustomerIdInput(customerIdInput);
      const response = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, amount: amountValue, dueDate }),
      });
      const data = await response.json();
      if (!response.ok) {
        setSaveError(data.error ?? "Gagal menyimpan piutang.");
        return;
      }
      setSuccess(true);
    } catch {
      setSaveError("Terjadi kesalahan koneksi.");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setCustomerIdInput("");
    setAmount("");
    setDueDate(defaultDueDate);
    setLookup({ status: "idle" });
    setShowConfirm(false);
    setSuccess(false);
    setSaveError(null);
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="text-lg font-bold text-maroon-900">Buat Hutang Baru</h2>
          <p className="text-xs text-neutral-400">harap masukkan informasi yang benar</p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (isFormValid) setShowConfirm(true);
          }}
        >
          <TextField
            label="ID Pelanggan"
            value={customerIdInput}
            onChange={(e) => setCustomerIdInput(e.target.value)}
            placeholder="mis. 0001"
            error={lookup.status === "not-found" ? "Nama Pelanggan: TIDAK DITEMUKAN, periksa kembali di menu pelanggan" : undefined}
            hint={lookup.status === "found" ? `Nama Pelanggan: ${lookup.name}` : undefined}
          />

          <TextField
            label="Jumlah Hutang"
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={amount && amountValue <= 0 ? "Jumlah hutang harus lebih dari 0." : undefined}
          />

          <TextField
            label="Tanggal Jatuh Tempo (Due)"
            type="date"
            min={todayValue}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            error={!dueDateValid ? "Tanggal jatuh tempo tidak boleh sebelum hari ini." : undefined}
          />

          <Button type="submit" size="lg" disabled={!isFormValid} className="mt-2">
            SAVE
          </Button>
        </form>
      </div>

      {showConfirm && lookup.status === "found" && (
        <Modal
          open
          onOpenChange={(open) => !open && !success && setShowConfirm(false)}
          title="Konfirmasi piutang baru"
        >
          {!success ? (
            <div className="flex flex-col gap-4">
              <p className="text-center text-lg font-bold text-maroon-900">Anda akan membuat</p>

              <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
                <div>
                  <p className="font-semibold text-maroon-900">
                    {lookup.name}{" "}
                    <span className="text-xs font-normal text-neutral-400">
                      id {formatCustomerId(parseCustomerIdInput(customerIdInput) ?? 0)}
                    </span>
                  </p>
                  <p className="text-base font-bold text-maroon-900">{formatRupiah(amountValue)}</p>
                  <p className="text-xs text-neutral-500">Due date {formatDate(dueDate)}</p>
                </div>
                <StatusBadge status="UNPAID" />
              </div>

              <p className="text-center text-sm font-medium text-neutral-600">
                Apakah informasi sudah sesuai?
              </p>

              {saveError && (
                <p className="text-center text-xs font-medium text-status-unpaid">{saveError}</p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="danger"
                  className="flex-1"
                  disabled={saving}
                  onClick={() => setShowConfirm(false)}
                >
                  BELUM
                </Button>
                <Button
                  variant="success"
                  className="flex-1"
                  disabled={saving}
                  onClick={handleConfirmSave}
                >
                  {saving ? "Menyimpan..." : "YA"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle2 size={48} className="text-status-paid" />
              <p className="text-sm text-neutral-600">
                Piutang baru untuk{" "}
                <span className="font-semibold text-maroon-900">{lookup.name}</span> berhasil
                dibuat
              </p>
              <Button onClick={resetForm} className="w-full">
                Tutup
              </Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
