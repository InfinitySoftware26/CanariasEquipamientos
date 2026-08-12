"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  RouteSheetFilterValues,
  RouteSheetFilters,
} from "@/components/route-sheets/RouteSheetFilter";

import { RouteSheetPageHeader } from "@/components/route-sheets/RouteSheetPageHeader";
import { RouteSheetStats } from "@/components/route-sheets/RouteSheetStats";
import { RouteSheetTable } from "@/components/route-sheets/RouteSheetTable";
import { AddButtonLink } from "@/components/button/AddButtonLink";
import { Plus } from "lucide-react";

import { useRouteSheets } from "@/hooks/route-sheets/useRouteSheets";

export default function RouteSheetsPage() {
  const router = useRouter();

  const { routeSheets, loading } = useRouteSheets();

  const [filters, setFilters] = useState<RouteSheetFilterValues>({});

  const filtered = useMemo(() => {
    return routeSheets.filter((sheet) => {
      if (filters.zoneId && sheet.zoneId !== filters.zoneId) {
        return false;
      }

      if (filters.staffId && sheet.staffId !== filters.staffId) {
        return false;
      }

      if (filters.status && sheet.status !== filters.status) {
        return false;
      }

      if (filters.routeDate && sheet.routeDate !== filters.routeDate) {
        return false;
      }

      return true;
    });
  }, [routeSheets, filters]);

  const pendingCount = useMemo(
    () =>
      filtered.filter((routeSheet) => routeSheet.status === "pending").length,
    [filtered],
  );

  const inProgressCount = useMemo(
    () =>
      filtered.filter((routeSheet) => routeSheet.status === "in_progress")
        .length,
    [filtered],
  );

  const completedCount = useMemo(
    () =>
      filtered.filter((routeSheet) => routeSheet.status === "completed").length,
    [filtered],
  );

  if (loading) {
    return <div className="p-6 text-white">Cargando hojas de ruta...</div>;
  }

  return (
    <div className="space-y-6">
      <RouteSheetPageHeader
        title="Hojas de Ruta"
        description="Administración de recorridos"
        action={
          <AddButtonLink href="/route-sheets/new">
            <Plus className="mr-2 h-5 w-5" />
            Nueva hoja
          </AddButtonLink>
        }
      />

      <RouteSheetStats
        total={filtered.length}
        pending={pendingCount}
        progress={inProgressCount}
        completed={completedCount}
      />

      <RouteSheetFilters filters={filters} onChange={setFilters} />

      <RouteSheetTable
        routeSheets={filtered}
        onSelect={(item) => router.push(`/route-sheets/${item.routeSheetId}`)}
      />
    </div>
  );
}
