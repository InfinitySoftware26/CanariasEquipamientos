"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { RouteSheetStatus } from "@/types/rotue-sheets/routeSheets.types";

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

  if (loading) {
    return <div className="text-white">Cargando hojas de ruta...</div>;
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
        pending={
          filtered.filter((r) => r.status === RouteSheetStatus.PENDING).length
        }
        progress={
          filtered.filter((r) => r.status === RouteSheetStatus.IN_PROGRESS)
            .length
        }
        completed={
          filtered.filter((r) => r.status === RouteSheetStatus.COMPLETED).length
        }
      />

      <RouteSheetFilters filters={filters} onChange={setFilters} />

      <RouteSheetTable
        routeSheets={filtered}
        onSelect={(item) => router.push(`/route-sheets/${item.routeSheetId}`)}
      />
    </div>
  );
}
