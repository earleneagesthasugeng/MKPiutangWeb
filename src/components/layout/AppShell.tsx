"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { MenuBar } from "@/components/layout/MenuBar";
import { PageTitleContext } from "@/components/layout/PageTitleContext";
import { SessionProvider } from "@/components/layout/SessionContext";
import type { SessionPayload } from "@/lib/session";

export function AppShell({
  session,
  children,
}: {
  session: SessionPayload;
  children: ReactNode;
}) {
  const [title, setTitle] = useState("Piutang Toko");
  const pathname = usePathname();
  const showMenuBar = !pathname.startsWith("/admin");

  return (
    <SessionProvider value={session}>
      <PageTitleContext.Provider value={setTitle}>
        <div className="flex min-h-screen flex-col bg-cream">
          <Navbar title={title} session={session} />
          {showMenuBar && <MenuBar pathname={pathname} />}
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
      </PageTitleContext.Provider>
    </SessionProvider>
  );
}
