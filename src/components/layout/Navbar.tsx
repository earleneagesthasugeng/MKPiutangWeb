"use client";

import { useRouter } from "next/navigation";
import { Menu as MenuIcon, LogOut, Shield } from "lucide-react";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/Menu";
import type { SessionPayload } from "@/lib/session";

export function Navbar({
  title,
  session,
}: {
  title: string;
  session: SessionPayload;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 bg-maroon-900 px-4 text-white sm:px-6">
      <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>

      <Menu>
        <MenuTrigger
          aria-label="Menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/10 focus:outline-none"
        >
          <MenuIcon size={20} />
        </MenuTrigger>
        <MenuContent>
          {session.role === "BOSS" && (
            <MenuItem onSelect={() => router.push("/admin")}>
              <span className="flex items-center gap-2">
                <Shield size={15} /> Admin
              </span>
            </MenuItem>
          )}
          <MenuItem onSelect={handleLogout}>
            <span className="flex items-center gap-2 text-status-unpaid">
              <LogOut size={15} /> Log Out
            </span>
          </MenuItem>
        </MenuContent>
      </Menu>
    </header>
  );
}
