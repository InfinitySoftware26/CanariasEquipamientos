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
  showStaffFilter?: boolean;
}

export function RouteSheetFilters({
  filters,
  onChange,
  showStaffFilter = true,
}: Props) {
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
text-white
outline-none
focus:border-cyan-500/50
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
      text-white
      placeholder:text-white/30
      outline-none
      focus:border-cyan-500/50
    "
      />

      {showStaffFilter && (
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
        text-white
        placeholder:text-white/30
        outline-none
        focus:border-cyan-500/50
      "
        />
      )}

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
      text-white
      outline-none
      focus:border-cyan-500/50
    "
      >
        <option value="">Todos los estados</option>

        <option value="pending">Pendiente</option>

        <option value="in_progress">En progreso</option>

        <option value="completed">Completada</option>

        <option value="cancelled">Cancelada</option>
      </select>
    </section>
  );
}
