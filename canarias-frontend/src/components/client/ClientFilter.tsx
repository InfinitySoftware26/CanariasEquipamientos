interface Props {
  search: string;
  onSearch: (value: string) => void;
}

export function ClientFilters({ search, onSearch }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Buscar por nombre..."
        className="input"
      />
    </div>
  );
}
