"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import type { AdminUserDTO } from "@/lib/types";

export function DeleteStaffModal({
  user,
  onClose,
  onDeleted,
}: {
  user: AdminUserDTO;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [currentBossPassword, setCurrentBossPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentBossPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal menghapus akun.");
        return;
      }
      onDeleted(user.id);
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onOpenChange={(open) => !open && onClose()} title="Hapus akun staff" showTitle>
      <div className="flex flex-col gap-4">
        <p className="text-center text-sm font-medium text-neutral-600">
          Yakin ingin menghapus akun{" "}
          <span className="font-semibold text-maroon-900">{user.displayName}</span> (
          {user.username})?
        </p>

        <TextField
          label="Password Anda (boss)"
          type="password"
          value={currentBossPassword}
          onChange={(e) => setCurrentBossPassword(e.target.value)}
        />

        {error && (
          <p className="text-center text-xs font-medium text-status-unpaid">{error}</p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" disabled={loading} onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={loading || !currentBossPassword}
            onClick={handleDelete}
          >
            {loading ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
