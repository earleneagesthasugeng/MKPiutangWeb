"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { usePageTitle } from "@/components/layout/PageTitleContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CustomerFormFields } from "@/components/customers/CustomerFormFields";
import { useCustomerValidation, type CustomerFormValues } from "@/hooks/useCustomerValidation";
import { formatRupiah } from "@/lib/format";

const EMPTY: CustomerFormValues = {
  fullName: "",
  businessName: "",
  address: "",
  phone: "",
};

export default function PelangganBaruPage() {
  usePageTitle("Pelanggan Baru");
  const router = useRouter();

  const [values, setValues] = useState<CustomerFormValues>(EMPTY);
  const { errors, isValid } = useCustomerValidation(values);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);

  async function handleConfirmSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        setSaveError(data.error ?? "Gagal menyimpan pelanggan.");
        return;
      }
      setCreatedName(data.customer.fullName);
    } catch {
      setSaveError("Terjadi kesalahan koneksi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="text-lg font-bold text-maroon-900">Pelanggan Baru</h2>
          <p className="text-xs text-neutral-400">harap masukkan informasi sesuai KTP</p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (isValid) setShowConfirm(true);
          }}
        >
          <CustomerFormFields values={values} errors={errors} onChange={setValues} />

          <Button type="submit" size="lg" disabled={!isValid} className="mt-2">
            SAVE
          </Button>
        </form>
      </div>

      {showConfirm && (
        <Modal
          open
          onOpenChange={(open) => !open && !createdName && setShowConfirm(false)}
          title="Konfirmasi pelanggan baru"
        >
          {!createdName ? (
            <div className="flex flex-col gap-4">
              <p className="text-center text-lg font-bold text-maroon-900">Anda akan membuat</p>

              <div className="rounded-xl border border-neutral-200 px-4 py-3">
                <p className="font-semibold text-maroon-900">{values.fullName}</p>
                <p className="text-sm text-neutral-500">{values.businessName}</p>
                <p className="text-sm text-neutral-500">{values.phone}</p>
                <p className="mt-1 text-xs font-bold text-status-unpaid">
                  Jumlah Piutang {formatRupiah(0)}
                </p>
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
                Pelanggan baru{" "}
                <span className="font-semibold text-maroon-900">{createdName}</span> berhasil
                dibuat
              </p>
              <Button onClick={() => router.push("/pelanggan")} className="w-full">
                Tutup
              </Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
