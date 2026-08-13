"use client";

interface Props {
  filters: {
    label: string;
    value: string;
  }[];

  current: string;

  onChange(value: string): void;

  search: string;

  onSearch(value: string): void;
}

export function InstallmentsFilters({
  filters,
  current,
  onChange,
  search,
  onSearch,
}: Props) {
  return (
    <section className="space-y-4">
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Buscar por cliente o venta..."
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={`rounded-xl px-4 py-2 transition ${
              current === filter.value
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
