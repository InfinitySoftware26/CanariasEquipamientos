type FilterType = "ALL" | "PENDING" | "CLOSED";

interface Filter {
  label: string;
  value: FilterType;
  count?: number;
}

interface Props {
  filters: Filter[];
  current: FilterType;
  onChange: (v: FilterType) => void;
  search?: string;
  onSearch?: (value: string) => void;
}

export function SalesFilters({
  filters,
  current,
  onChange,
  search = "",
  onSearch,
}: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#111827] p-5 shadow-xl lg:flex-row lg:items-center lg:justify-between">
      {/* Buscador */}
      <div className="relative w-full lg:max-w-md">
        <input
          value={search}
          onChange={(e) => {
            console.log("CHANGE", e.target.value);
            console.log("onSearch:", onSearch);
            onSearch?.(e.target.value);
          }}
          placeholder="Buscar por cliente o número de venta..."
          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-[#0B1220]
            py-3
            pl-12
            pr-5
            text-sm
            text-white
            outline-none
            transition-all
            placeholder:text-white/30
            focus:border-[#F5A300]
            focus:ring-2
            focus:ring-[#F5A300]/20
          "
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => {
          const active = current === item.value;

          return (
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={`
                flex items-center gap-2
                rounded-2xl
                px-4
                py-2.5
                text-sm
                font-medium
                transition-all
                duration-200

                ${
                  active
                    ? "bg-[#F5A300] text-black shadow-lg"
                    : "border border-white/10 bg-[#0B1220] text-white/70 hover:border-[#F5A300]/40 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <span>{item.label}</span>

              {item.count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    active ? "bg-black/10" : "bg-white/10 text-white/80"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
