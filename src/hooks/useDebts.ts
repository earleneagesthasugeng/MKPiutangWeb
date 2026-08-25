"use client";

import { useCallback, useEffect, useState } from "react";
import type { DebtDTO } from "@/lib/types";

export type DebtQueryParams = {
  search?: string;
  statusGroup?: "BELUM_LUNAS" | "LUNAS";
  status?: "UNPAID" | "PARTIAL" | "PAID";
  overdueOnly?: boolean;
  customerId?: number;
  sort?: "date_desc" | "date_asc" | "name_asc";
  page: number;
  pageSize?: number;
};

function buildQuery(params: DebtQueryParams) {
  const search = new URLSearchParams();
  if (params.search) search.set("search", params.search);
  if (params.statusGroup) search.set("statusGroup", params.statusGroup);
  if (params.status) search.set("status", params.status);
  if (params.overdueOnly) search.set("overdueOnly", "true");
  if (params.customerId) search.set("customerId", String(params.customerId));
  if (params.sort) search.set("sort", params.sort);
  search.set("page", String(params.page));
  search.set("pageSize", String(params.pageSize ?? 8));
  return search.toString();
}

export function useDebts(params: DebtQueryParams) {
  const [debts, setDebts] = useState<DebtDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(params.pageSize ?? 8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const queryString = buildQuery(params);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/debts?${queryString}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Gagal memuat data piutang.");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setDebts(data.debts);
        setTotal(data.total);
        setPageSize(data.pageSize);
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
  }, [queryString, reloadToken]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return { debts, total, totalPages, pageSize, loading, error, refetch, setDebts };
}
