"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, UserPlus, Shield } from "lucide-react";
import { usePageTitle } from "@/components/layout/PageTitleContext";
import { Button } from "@/components/ui/Button";
import { AdminUserFormModal } from "@/components/admin/AdminUserFormModal";
import { DeleteStaffModal } from "@/components/admin/DeleteStaffModal";
import type { AdminUserDTO } from "@/lib/types";

export default function AdminPage() {
  usePageTitle("Admin");

  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<AdminUserDTO | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUserDTO | null>(null);

  function loadUsers() {
    setLoading(true);
    setError(null);
    fetch("/api/admin/users")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Gagal memuat akun.");
        return data;
      })
      .then((data) => setUsers(data.users))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const boss = users.find((u) => u.role === "BOSS");
  const staff = users.filter((u) => u.role === "STAFF");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      {loading ? (
        <p className="text-center text-sm text-neutral-400">Memuat...</p>
      ) : error ? (
        <p className="text-center text-sm font-medium text-status-unpaid">{error}</p>
      ) : (
        <>
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-maroon-900">
              <Shield size={16} /> Akun Boss
            </h2>
            {boss && (
              <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
                <div>
                  <p className="font-semibold text-maroon-900">{boss.displayName}</p>
                  <p className="text-xs text-neutral-400">{boss.username}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditingUser(boss)}>
                  <Pencil size={14} /> Edit
                </Button>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-maroon-900">
                Akun Staff
              </h2>
              <Button size="sm" onClick={() => setCreating(true)}>
                <UserPlus size={14} /> Tambah Staff
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {staff.length === 0 && (
                <p className="text-sm text-neutral-400">Belum ada akun staff.</p>
              )}
              {staff.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-maroon-900">{user.displayName}</p>
                    <p className="text-xs text-neutral-400">{user.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeletingUser(user)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {editingUser && (
        <AdminUserFormModal
          mode="edit"
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={(updated) => {
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
          }}
        />
      )}

      {creating && (
        <AdminUserFormModal
          mode="create"
          onClose={() => setCreating(false)}
          onSaved={(created) => {
            setUsers((prev) => [...prev, created]);
          }}
        />
      )}

      {deletingUser && (
        <DeleteStaffModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onDeleted={(id) => {
            setUsers((prev) => prev.filter((u) => u.id !== id));
            setDeletingUser(null);
          }}
        />
      )}
    </div>
  );
}
