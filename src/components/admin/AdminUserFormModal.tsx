"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import type { AdminUserDTO } from "@/lib/types";

export function AdminUserFormModal({
  mode,
  user,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  user?: AdminUserDTO;
  onClose: () => void;
  onSaved: (user: AdminUserDTO) => void;
}) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [password, setPassword] = useState("");
  const [currentBossPassword, setCurrentBossPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValid =
    username.trim().length > 0 &&
    username.trim().length <= 50 &&
    displayName.trim().length > 0 &&
    displayName.trim().length <= 50 &&
    (mode === "edit" || password.length >= 6) &&
    (password.length === 0 || password.length >= 6) &&
    currentBossPassword.length > 0;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        mode === "create" ? "/api/admin/users" : `/api/admin/users/${user!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "create"
              ? { username, displayName, password, currentBossPassword }
              : { username, displayName, newPassword: password, currentBossPassword }
          ),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan.");
        return;
      }
      onSaved(data.user);
      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onOpenChange={(open) => !open && onClose()}
      title={mode === "create" ? "Tambah staff baru" : "Edit akun"}
      showTitle
    >
      {!success ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (isValid) handleSave();
          }}
        >
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Nama"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <TextField
            label={mode === "create" ? "Password" : "Password Baru (opsional)"}
            type="password"
            placeholder={mode === "edit" ? "Kosongkan jika tidak diganti" : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <hr className="border-neutral-200" />

          <TextField
            label="Password Anda (boss)"
            type="password"
            hint="Wajib diisi untuk verifikasi sebelum menyimpan perubahan"
            value={currentBossPassword}
            onChange={(e) => setCurrentBossPassword(e.target.value)}
          />

          {error && <p className="text-xs font-medium text-status-unpaid">{error}</p>}

          <Button type="submit" disabled={!isValid || saving}>
            {saving ? "Menyimpan..." : "SAVE"}
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckCircle2 size={48} className="text-status-paid" />
          <p className="text-sm text-neutral-600">Akun berhasil disimpan</p>
          <Button onClick={onClose} className="w-full">
            Tutup
          </Button>
        </div>
      )}
    </Modal>
  );
}
