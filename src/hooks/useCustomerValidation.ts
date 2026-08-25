"use client";

import { useEffect, useState } from "react";

export type CustomerFormValues = {
  fullName: string;
  businessName: string;
  address: string;
  phone: string;
};

export type CustomerFormErrors = Partial<Record<keyof CustomerFormValues, string>>;

const LIMITS: Record<keyof CustomerFormValues, number> = {
  fullName: 50,
  businessName: 50,
  address: 100,
  phone: 20,
};

const LABELS: Record<keyof CustomerFormValues, string> = {
  fullName: "Nama lengkap",
  businessName: "Instansi/toko",
  address: "Alamat",
  phone: "Nomor telepon",
};

export function useCustomerValidation(values: CustomerFormValues, excludeId?: number) {
  const [nameAvailable, setNameAvailable] = useState(true);
  const [checkingName, setCheckingName] = useState(false);

  useEffect(() => {
    const trimmed = values.fullName.trim();
    if (!trimmed || trimmed.length > LIMITS.fullName) {
      setNameAvailable(true);
      return;
    }

    let cancelled = false;
    setCheckingName(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ name: trimmed });
      if (excludeId) params.set("excludeId", String(excludeId));
      fetch(`/api/customers/check-name?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setNameAvailable(Boolean(data.available));
        })
        .catch(() => {
          if (!cancelled) setNameAvailable(true);
        })
        .finally(() => {
          if (!cancelled) setCheckingName(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [values.fullName, excludeId]);

  const errors: CustomerFormErrors = {};

  (Object.keys(LIMITS) as (keyof CustomerFormValues)[]).forEach((key) => {
    const value = values[key].trim();
    if (!value) {
      errors[key] = `${LABELS[key]} wajib diisi.`;
    } else if (value.length > LIMITS[key]) {
      errors[key] = `Maksimal ${LIMITS[key]} karakter.`;
    }
  });

  if (!errors.fullName && !nameAvailable) {
    errors.fullName = "Nama pelanggan sudah dipakai, gunakan nama lain.";
  }

  const isValid = Object.keys(errors).length === 0 && !checkingName;

  return { errors, isValid, checkingName, limits: LIMITS };
}
