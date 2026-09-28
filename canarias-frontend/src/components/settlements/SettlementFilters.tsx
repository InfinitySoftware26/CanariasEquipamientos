"use client";

import { SettlementStatus } from "@/types/settlements/settlement.types";

interface Props {
  filters: { label: string; value: "all" | SettlementStatus }[];

  status: "all" | SettlementStatus;
  onStatusChange(value: "all" | SettlementStatus): void;

  staffId: string;
  onStaffIdChange(value: string): void;
}

export function SettlementFilters({
  filters,
  status,
  onStatusChange,
  staffId,
  onStaffIdChange,
}: Props) {
  return (
    <section className="space-y-4">
      <input
        value={staffId}
        onChange={(e) => onStaffIdChange(e.target.value)}
        placeholder="Buscar por ID de cobrador..."
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onStatusChange(filter.value)}
            className={`rounded-xl px-4 py-2 transition ${
              status === filter.value
                ? "bg-[#F5A300] text-black"
                : "bg-slate-900 text-white"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </section>
  );
}
