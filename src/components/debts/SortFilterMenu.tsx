"use client";

import { SlidersHorizontal, Check } from "lucide-react";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/Menu";
import { Button } from "@/components/ui/Button";

export type SortValue = "date_desc" | "date_asc" | "name_asc";

const OPTIONS: { value: SortValue; label: string }[] = [
  { value: "date_desc", label: "Tanggal terbaru" },
  { value: "date_asc", label: "Tanggal terlama" },
  { value: "name_asc", label: "Nama pelanggan A-Z" },
];

export function SortFilterMenu({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (value: SortValue) => void;
}) {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline" size="md">
          <SlidersHorizontal size={14} /> Filter
        </Button>
      </MenuTrigger>
      <MenuContent>
        {OPTIONS.map((opt) => (
          <MenuItem key={opt.value} onSelect={() => onChange(opt.value)}>
            <span className="flex items-center justify-between gap-3">
              {opt.label}
              {value === opt.value && <Check size={14} />}
            </span>
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
