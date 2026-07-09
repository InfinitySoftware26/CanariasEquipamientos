interface Props {
  search: string;
  onSearch: (value: string) => void;
}

export function ClientFilters({ search, onSearch }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1726] p-4">
      <div className="relative">
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar por nombre, apellido o DNI..."
          className="
            w-full
            rounded-xl
            border
            border-white/10
            bg-[#0B1220]
            py-3
            pl-11
            pr-4
            text-white
            placeholder:text-white/40
            focus:border-[#F5A300]
            focus:outline-none
          "
        />
      </div>
    </div>
  );
}
