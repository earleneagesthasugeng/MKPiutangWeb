"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CustomerFormFields } from "@/components/customers/CustomerFormFields";
import { useCustomerValidation, type CustomerFormValues } from "@/hooks/useCustomerValidation";
import type { CustomerDTO } from "@/lib/types";

type Step = "form" | "confirm" | "success";

export function EditCustomerModal({
  customer,
  onClose,
  onSaved,
}: {
  customer: CustomerDTO;
  onClose: () => void;
  onSaved: (updated: CustomerDTO) => void;
}) {
  const [step, setStep] = useState<Step>("form");
  const [values, setValues] = useState<CustomerFormValues>({
    fullName: customer.fullName,
    businessName: customer.businessName,
    address: customer.address,
    phone: customer.phone,
  });
  const { errors, isValid } = useCustomerValidation(values, customer.id);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleConfirmSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        setSaveError(data.error ?? "Gagal menyimpan perubahan.");
        return;
      }
      onSaved(data.customer);
      setStep("success");
    } catch {
      setSaveError("Terjadi kesalahan koneksi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onOpenChange={(open) => !open && onClose()}
      title="Edit informasi pelanggan"
      showTitle
    >
      {step === "form" && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (isValid) setStep("confirm");
          }}
        >
          <CustomerFormFields values={values} errors={errors} onChange={setValues} />
          <Button type="submit" disabled={!isValid}>
            SAVE
          </Button>
        </form>
      )}

      {step === "confirm" && (
        <div className="flex flex-col gap-4">
          <p className="text-center text-lg font-bold text-maroon-900">
            Perbarui informasi pelanggan?
          </p>
          <div className="rounded-xl border border-neutral-200 px-4 py-3">
            <p className="font-semibold text-maroon-900">{values.fullName}</p>
            <p className="text-sm text-neutral-500">{values.businessName}</p>
            <p className="text-sm text-neutral-500">{values.address}</p>
            <p className="text-sm text-neutral-500">{values.phone}</p>
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
              onClick={() => setStep("form")}
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
      )}

      {step === "success" && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckCircle2 size={48} className="text-status-paid" />
          <p className="text-sm text-neutral-600">Informasi pelanggan berhasil diperbarui</p>
          <Button onClick={onClose} className="w-full">
            Tutup
          </Button>
        </div>
      )}
    </Modal>
  );
}
