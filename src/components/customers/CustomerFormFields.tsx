import { TextField } from "@/components/ui/TextField";
import type { CustomerFormErrors, CustomerFormValues } from "@/hooks/useCustomerValidation";

export function CustomerFormFields({
  values,
  errors,
  onChange,
}: {
  values: CustomerFormValues;
  errors: CustomerFormErrors;
  onChange: (values: CustomerFormValues) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Nama Lengkap Pelanggan"
        value={values.fullName}
        onChange={(e) => onChange({ ...values, fullName: e.target.value })}
        error={errors.fullName}
        hint={!errors.fullName && values.fullName.trim() ? "Nama Pelanggan unik" : undefined}
      />
      <TextField
        label="Instansi/Toko"
        value={values.businessName}
        onChange={(e) => onChange({ ...values, businessName: e.target.value })}
        error={errors.businessName}
      />
      <TextField
        label="Alamat"
        value={values.address}
        onChange={(e) => onChange({ ...values, address: e.target.value })}
        error={errors.address}
      />
      <TextField
        label="Nomor Telepon"
        value={values.phone}
        onChange={(e) => onChange({ ...values, phone: e.target.value })}
        error={errors.phone}
      />
    </div>
  );
}
