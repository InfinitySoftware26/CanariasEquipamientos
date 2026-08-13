"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { RouteSheetTable } from "@/components/route-sheets/RouteSheetTable";
import {
  RouteSheetFilters,
  RouteSheetFilterValues,
} from "@/components/route-sheets/RouteSheetFilter";

import { useMyRouteSheets } from "@/hooks/route-sheets/useMyRouteSheet";

export default function CollectorRoutesPage() {
  const router = useRouter();

  const { routeSheets, loading } = useMyRouteSheets();

  const [filters, setFilters] = useState<RouteSheetFilterValues>({});

  const filteredRouteSheets = useMemo(() => {
    return routeSheets.filter((route) => {
      if (filters.routeDate && route.routeDate !== filters.routeDate) {
        return false;
      }

      if (filters.zoneId && route.zoneId !== filters.zoneId) {
        return false;
      }

      if (filters.status && route.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [routeSheets, filters]);

  const stats = useMemo(() => {
    return {
      total: filteredRouteSheets.length,

      pending: filteredRouteSheets.filter((route) => route.status === "pending")
        .length,

      inProgress: filteredRouteSheets.filter(
        (route) => route.status === "in_progress",
      ).length,

      completed: filteredRouteSheets.filter(
        (route) => route.status === "completed",
      ).length,

      cancelled: filteredRouteSheets.filter(
        (route) => route.status === "cancelled",
      ).length,
    };
  }, [filteredRouteSheets]);

  if (loading) {
    return (
      <div className="space-y-6">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-bold text-white">Mis hojas de ruta </h1>
          <p className="mt-2 text-white/50">
            Cargando las hojas de ruta asignadas...
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
          Cargando rutas...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}{" "}
      <section>
        {" "}
        <h1 className="text-3xl font-bold text-white">Mis hojas de ruta </h1>
        <p className="mt-2 text-sm text-white/50">
          Consultá y gestioná las hojas de ruta que tenés asignadas.
        </p>
      </section>
      {/* STATS */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/50">Total</p>

          <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/50">Pendientes</p>

          <p className="mt-2 text-3xl font-bold text-yellow-400">
            {stats.pending}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/50">En progreso</p>

          <p className="mt-2 text-3xl font-bold text-cyan-400">
            {stats.inProgress}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/50">Completadas</p>

          <p className="mt-2 text-3xl font-bold text-green-400">
            {stats.completed}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/50">Canceladas</p>

          <p className="mt-2 text-3xl font-bold text-red-400">
            {stats.cancelled}
          </p>
        </div>
      </section>
      {/* FILTERS */}
      <RouteSheetFilters filters={filters} onChange={setFilters} />
      {/* TABLE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Rutas asignadas
            </h2>

            <p className="text-sm text-white/40">
              {filteredRouteSheets.length}{" "}
              {filteredRouteSheets.length === 1
                ? "hoja encontrada"
                : "hojas encontradas"}
            </p>
          </div>
        </div>

        <RouteSheetTable
          routeSheets={filteredRouteSheets}
          onSelect={(route) => {
            router.push(`/route-sheets/collector/${route.routeSheetId}`);
          }}
        />
      </section>
    </div>
  );
}
