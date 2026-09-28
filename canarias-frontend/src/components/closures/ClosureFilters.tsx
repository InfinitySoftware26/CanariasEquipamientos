"use client";

import { DailyClosureStatus } from "@/types/closures/closure.types";

interface Props {
  filters: { label: string; value: "all" | DailyClosureStatus }[];

  status: "all" | DailyClosureStatus;
  onStatusChange(value: "all" | DailyClosureStatus): void;

  closingDate: string;
  onClosingDateChange(value: string): void;
}

export function ClosureFilters({
  filters,
  status,
  onStatusChange,
  closingDate,
  onClosingDateChange,
}: Props) {
  return (
    <section className="space-y-4">
      <input
        type="date"
        value={closingDate}
        onChange={(e) => onClosingDateChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none sm:w-64"
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
