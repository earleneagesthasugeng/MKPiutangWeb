"use client";

import { ChevronDown } from "lucide-react";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/Menu";

export type StatusGroup = "BELUM_LUNAS" | "LUNAS";

const LABELS: Record<StatusGroup, string> = {
  BELUM_LUNAS: "BELUM LUNAS",
  LUNAS: "LUNAS",
};

export function StatusToggleMenu({
  value,
  onChange,
}: {
  value: StatusGroup;
  onChange: (value: StatusGroup) => void;
}) {
  return (
    <Menu>
      <MenuTrigger className="mx-auto flex items-center gap-2 rounded-full bg-maroon-700 px-6 py-2 text-sm font-bold text-white hover:bg-maroon-800 focus:outline-none">
        {LABELS[value]} <ChevronDown size={16} />
      </MenuTrigger>
      <MenuContent align="center">
        <MenuItem onSelect={() => onChange("BELUM_LUNAS")}>BELUM LUNAS</MenuItem>
        <MenuItem onSelect={() => onChange("LUNAS")}>LUNAS</MenuItem>
      </MenuContent>
    </Menu>
  );
}
