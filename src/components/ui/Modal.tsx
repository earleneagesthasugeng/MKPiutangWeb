"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Modal({
  open,
  onOpenChange,
  title,
  showTitle = false,
  children,
  className,
  closable = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  showTitle?: boolean;
  children: ReactNode;
  className?: string;
  closable?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          onEscapeKeyDown={(e) => !closable && e.preventDefault()}
          onPointerDownOutside={(e) => !closable && e.preventDefault()}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl bg-white p-6 shadow-xl focus:outline-none max-h-[90vh] overflow-y-auto",
            className
          )}
        >
          <Dialog.Title className={showTitle ? "mb-4 text-lg font-bold text-maroon-900" : "sr-only"}>
            {title}
          </Dialog.Title>
          {closable && (
            <Dialog.Close
              aria-label="Tutup"
              className="absolute right-4 top-4 rounded-full bg-status-unpaid p-1 text-white hover:brightness-95"
            >
              <X size={16} />
            </Dialog.Close>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
