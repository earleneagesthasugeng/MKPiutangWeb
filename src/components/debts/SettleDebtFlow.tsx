"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { displayDebtAmount, formatDate, formatRupiah } from "@/lib/format";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/payment-method";
import type { DebtDTO, PaymentMethod } from "@/lib/types";

type Step = "confirm" | "partialInput" | "methodPaid" | "auth" | "authError" | "success";

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function MethodPicker({
  value,
  onChange,
}: {
  value: PaymentMethod | null;
  onChange: (value: PaymentMethod) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PAYMENT_METHOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
            value === opt.value
              ? "border-maroon-700 bg-maroon-700 text-white"
              : "border-neutral-300 bg-white text-maroon-800 hover:bg-maroon-50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SettleDebtFlow({
  debt,
  onCancel,
  onSettled,
}: {
  debt: DebtDTO;
  onCancel: () => void;
  onSettled: (updated: DebtDTO) => void;
}) {
  const [step, setStep] = useState<Step>("confirm");
  const [decision, setDecision] = useState<"PAID" | "PARTIAL" | null>(null);
  const [cicilanInput, setCicilanInput] = useState("");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resultDebt, setResultDebt] = useState<DebtDTO | null>(null);

  const cicilan = Number(cicilanInput) || 0;
  const sisaHutang = Math.max(0, Math.round((debt.remaining - cicilan) * 100) / 100);
  const cicilanValid = cicilan > 0 && cicilan <= debt.remaining;
  const noteWordCount = countWords(note);
  const noteValid = method !== "OTHER" || noteWordCount <= 100;
  const methodStepValid = method !== null && noteValid;

  async function submitSettlement() {
    setLoading(true);
    try {
      const response = await fetch(`/api/debts/${debt.id}/settle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          cicilan: decision === "PARTIAL" ? cicilan : undefined,
          method,
          note: method === "OTHER" && note.trim() ? note.trim() : undefined,
          bossPassword: password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error ?? "Gagal menyimpan.");
        setStep("authError");
        return;
      }
      setResultDebt(data.debt);
      onSettled(data.debt);
      setStep("success");
    } catch {
      setErrorMessage("Terjadi kesalahan koneksi.");
      setStep("authError");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open
      onOpenChange={(open) => !open && onCancel()}
      title="Selesaikan piutang"
      closable={step !== "auth"}
    >
      {step === "confirm" && (
        <div className="flex flex-col gap-4">
          <p className="text-center text-lg font-bold text-maroon-900">Anda akan menyelesaikan</p>

          <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
            <div>
              <p className="font-semibold text-maroon-900">
                {debt.customerName} <span className="text-xs font-normal text-neutral-400">id {debt.customerIdFormatted}</span>
              </p>
              {debt.status === "PARTIAL" && (
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                  Sisa Hutang
                </p>
              )}
              <p className="text-base font-bold text-maroon-900">
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

          <p className="text-center text-sm font-medium text-neutral-600">
            Apakah anda yakin ini sudah selesai?
          </p>

          <div className="flex flex-col gap-2">
            <Button
              variant="success"
              onClick={() => {
                setDecision("PAID");
                setStep("methodPaid");
              }}
            >
              YA
            </Button>
            <Button
              variant="warning"
              onClick={() => {
                setDecision("PARTIAL");
                setStep("partialInput");
              }}
            >
              PARTIAL
            </Button>
            <Button variant="danger" onClick={onCancel}>
              BELUM
            </Button>
          </div>
        </div>
      )}

      {step === "methodPaid" && (
        <div className="flex flex-col gap-4">
          <p className="text-center text-lg font-bold text-maroon-900">Metode pembayaran</p>

          <MethodPicker value={method} onChange={setMethod} />

          {method === "OTHER" && (
            <TextField
              label="Catatan (opsional, maksimal 100 kata)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              error={noteWordCount > 100 ? `Catatan ${noteWordCount} kata, maksimal 100 kata.` : undefined}
            />
          )}

          <p className="text-center text-sm font-medium text-neutral-600">
            Apakah informasi sudah benar?
          </p>

          <div className="flex flex-col gap-2">
            <Button variant="success" disabled={!methodStepValid} onClick={() => setStep("auth")}>
              YA
            </Button>
            <Button variant="danger" onClick={onCancel}>
              BELUM
            </Button>
          </div>
        </div>
      )}

      {step === "partialInput" && (
        <div className="flex flex-col gap-4">
          <p className="text-center text-lg font-bold text-maroon-900">Masukkan besar cicilan</p>

          <TextField
            label="Rupiah"
            type="number"
            min={1}
            value={cicilanInput}
            onChange={(e) => setCicilanInput(e.target.value)}
            placeholder="0"
            error={cicilanInput && !cicilanValid ? "Cicilan harus antara Rp1 sampai sisa hutang." : undefined}
          />

          <p className="text-center text-sm font-medium text-neutral-600">
            Sisa Hutang{" "}
            <span className="font-bold text-maroon-900">{formatRupiah(sisaHutang)}</span>
          </p>

          <p className="text-sm font-semibold text-maroon-900">Metode pembayaran</p>
          <MethodPicker value={method} onChange={setMethod} />

          {method === "OTHER" && (
            <TextField
              label="Catatan (opsional, maksimal 100 kata)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              error={noteWordCount > 100 ? `Catatan ${noteWordCount} kata, maksimal 100 kata.` : undefined}
            />
          )}

          <p className="text-center text-sm font-medium text-neutral-600">
            Apakah informasi sudah benar?
          </p>

          <div className="flex flex-col gap-2">
            <Button
              variant="success"
              disabled={!cicilanValid || !methodStepValid}
              onClick={() => setStep("auth")}
            >
              YA
            </Button>
            <Button variant="danger" onClick={onCancel}>
              BELUM
            </Button>
          </div>
        </div>
      )}

      {step === "auth" && (
        <div className="flex flex-col gap-4">
          <p className="text-center text-lg font-bold text-maroon-900">
            Silakan lakukan autentikasi
          </p>
          <p className="text-center text-sm text-neutral-500">
            Masukkan password boss untuk autentikasi
          </p>

          <TextField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              CANCEL
            </Button>
            <Button
              className="flex-1"
              onClick={submitSettlement}
              disabled={loading || !password}
            >
              {loading ? "Menyimpan..." : "SAVE"}
            </Button>
          </div>
        </div>
      )}

      {step === "authError" && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <XCircle size={48} className="text-status-unpaid" />
          <p className="text-sm font-medium text-neutral-700">{errorMessage}</p>
          <p className="text-xs text-neutral-400">Penyelesaian piutang dibatalkan.</p>
          <Button onClick={onCancel} className="w-full">
            Tutup
          </Button>
        </div>
      )}

      {step === "success" && resultDebt && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          {resultDebt.status === "PAID" ? (
            <CheckCircle2 size={48} className="text-status-paid" />
          ) : (
            <AlertTriangle size={48} className="text-status-partial" />
          )}
          <p className="text-sm text-neutral-600">
            Hutang <span className="font-semibold text-maroon-900">{debt.customerName}</span>{" "}
            {resultDebt.status === "PARTIAL" ? "dengan sisa" : "sebesar"}{" "}
            <span className="font-semibold text-maroon-900">
              {formatRupiah(displayDebtAmount(resultDebt))}
            </span>
            {resultDebt.status === "PARTIAL" && (
              <span className="text-neutral-400"> dari {formatRupiah(resultDebt.amount)}</span>
            )}{" "}
            berhasil di set menjadi
          </p>
          <StatusBadge status={resultDebt.status} />
          <Button onClick={onCancel} className="mt-2 w-full">
            Tutup
          </Button>
        </div>
      )}
    </Modal>
  );
}
