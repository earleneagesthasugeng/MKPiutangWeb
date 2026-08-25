"use client";

import { useCallback, useEffect, useState } from "react";
import type { CustomerListItemDTO } from "@/lib/types";

export function useCustomers({
  search,
  page,
  pageSize = 5,
}: {
  search: string;
  page: number;
  pageSize?: number;
}) {
  const [customers, setCustomers] = useState<CustomerListItemDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ totalUnpaidOutstanding: 0, totalPaid: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (search) params.set("search", search);

    fetch(`/api/customers?${params.toString()}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Gagal memuat data pelanggan.");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setCustomers(data.customers);
        setTotal(data.total);
        setSummary(data.summary);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, page, pageSize, reloadToken]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return { customers, total, totalPages, summary, loading, error, refetch };
}
