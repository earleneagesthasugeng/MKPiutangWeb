"use client";

import { createContext, useContext, useEffect } from "react";

export const PageTitleContext = createContext<(title: string) => void>(() => {});

export function usePageTitle(title: string) {
  const setTitle = useContext(PageTitleContext);
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
}
