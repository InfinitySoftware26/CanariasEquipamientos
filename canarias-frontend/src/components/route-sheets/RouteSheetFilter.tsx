"use client";

import { RouteSheetStatus } from "@/types/rotue-sheets/routeSheets.types";

export interface RouteSheetFilterValues {
  zoneId?: string;
  staffId?: string;
  status?: RouteSheetStatus;
  routeDate?: string;
}

interface Props {
  filters: RouteSheetFilterValues;
  onChange: (filters: RouteSheetFilterValues) => void;
}

export function RouteSheetFilters({ filters, onChange }: Props) {
  function update(key: keyof RouteSheetFilterValues, value: string) {
    onChange({
      ...filters,
      [key]: value || undefined,
    });
  }

  return (
    <section
      className="
rounded-3xl
border
border-white/10
bg-white/5
p-5
grid
gap-4
md:grid-cols-4
"
    >
      <input
        type="date"
        value={filters.routeDate ?? ""}
        onChange={(e) => update("routeDate", e.target.value)}
        className="
rounded-xl
bg-black/20
border
border-white/10
px-4
py-3
"
      />

      <input
        placeholder="ID Zona"
        value={filters.zoneId ?? ""}
        onChange={(e) => update("zoneId", e.target.value)}
        className="
rounded-xl
bg-black/20
border
border-white/10
px-4
py-3
"
      />

      <input
        placeholder="ID Cobrador"
        value={filters.staffId ?? ""}
        onChange={(e) => update("staffId", e.target.value)}
        className="
rounded-xl
bg-black/20
border
border-white/10
px-4
py-3
"
      />

      <select
        value={filters.status ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className="
rounded-xl
bg-black/20
border
border-white/10
px-4
py-3
"
      >
        <option value="">Todos los estados</option>

        <option value="PENDING">Pendiente</option>

        <option value="IN_PROGRESS">En progreso</option>

        <option value="COMPLETED">Completada</option>

        <option value="CANCELLED">Cancelada</option>
      </select>
    </section>
  );
}
