"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal login.");
        return;
      }
      router.replace("/piutang");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan koneksi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-maroon-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-maroon-900">Piutang Toko</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Masuk untuk mengelola piutang pelanggan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Username"
            id="username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="rounded-lg bg-status-unpaid-bg px-3 py-2 text-sm font-medium text-status-unpaid">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <User size={12} /> Boss & Staff
          </span>
          <span className="flex items-center gap-1">
            <Lock size={12} /> Akses terbatas
          </span>
        </div>
      </div>
    </div>
  );
}
