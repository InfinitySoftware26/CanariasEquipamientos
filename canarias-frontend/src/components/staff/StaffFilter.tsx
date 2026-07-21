"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface StaffFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function StaffFilter({ value, onChange }: StaffFilterProps) {
  return (
    <div className="relative mb-6">
      <Search
        size={18}
        className="
      absolute
      left-3
      inset-y-0
      my-auto
      text-white/40
      pointer-events-none
    "
      />

      <Input
        value={value}
        placeholder="     Buscar por nombre, DNI, email o rol..."
        onChange={(e) => onChange(e.target.value)}
        className="
      h-11
      pl-12
      pr-2.5
      border-white/10
      bg-white/5
      text-white
      placeholder:text-white/40
    "
      />
    </div>
  );
}
