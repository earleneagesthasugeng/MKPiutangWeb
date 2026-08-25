"use client";

import * as RadixMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";

export const Menu = RadixMenu.Root;
export const MenuTrigger = RadixMenu.Trigger;

export function MenuContent({
  className,
  align = "end",
  ...props
}: React.ComponentProps<typeof RadixMenu.Content>) {
  return (
    <RadixMenu.Portal>
      <RadixMenu.Content
        align={align}
        sideOffset={8}
        className={cn(
          "z-50 min-w-[11rem] rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg",
          className
        )}
        {...props}
      />
    </RadixMenu.Portal>
  );
}

export function MenuItem({
  className,
  ...props
}: React.ComponentProps<typeof RadixMenu.Item>) {
  return (
    <RadixMenu.Item
      className={cn(
        "cursor-pointer select-none rounded-lg px-3 py-2 text-sm font-semibold text-maroon-800",
        "outline-none data-[highlighted]:bg-maroon-50",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40",
        className
      )}
      {...props}
    />
  );
}
