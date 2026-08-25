"use client";

import { createContext, useContext } from "react";
import type { SessionPayload } from "@/lib/session";

const SessionContext = createContext<SessionPayload | null>(null);

export const SessionProvider = SessionContext.Provider;

export function useSession(): SessionPayload {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession dipakai di luar SessionProvider.");
  }
  return session;
}
