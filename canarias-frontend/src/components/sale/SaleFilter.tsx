type FilterType = "ALL" | "PENDING" | "CLOSED";

export function SalesFilters({
  filters,
  current,
  onChange,
}: {
  filters: { label: string; value: FilterType }[];
  current: FilterType;
  onChange: (v: FilterType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`rounded-full px-5 py-2 text-sm transition ${
            current === item.value
              ? "bg-[#F5A300] text-black"
              : "bg-slate-900 border border-white/10 text-white/70"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
