"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, FileText, FilePlus2, AlertTriangle, Users } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/piutang", label: "Lihat Piutang", icon: FileText },
  { href: "/piutang/baru", label: "Buat baru", icon: FilePlus2 },
  { href: "/piutang/lewat-tenggat", label: "Lewat tenggat", icon: AlertTriangle },
  { href: "/pelanggan", label: "Pelanggan", icon: Users },
];

export function MenuBar({ pathname }: { pathname: string }) {
  const router = useRouter();

  function isActive(href: string) {
    if (href === "/piutang") return pathname === "/piutang";
    return pathname.startsWith(href);
  }

  return (
    <div className="sticky top-16 z-20 flex h-14 items-center gap-2 overflow-x-auto border-b border-neutral-200 bg-white px-3 sm:px-6">
      <button
        type="button"
        aria-label="Kembali"
        onClick={() => router.back()}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-maroon-800 hover:bg-maroon-50"
      >
        <ChevronLeft size={18} />
      </button>

      {TABS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
              active
                ? "bg-maroon-800 text-white"
                : "bg-white text-maroon-800 hover:bg-maroon-50"
            )}
          >
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
