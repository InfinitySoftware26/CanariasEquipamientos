"use client";

import { RouteSheetCard } from "@/components/route-sheets/RouteSheetCard";
import { useMyRouteSheets } from "@/hooks/route-sheets/useMyRouteSheet";

import { useRouter } from "next/navigation";

export default function CollectorRoutesPage() {
  const { routeSheets, loading } = useMyRouteSheets();

  const router = useRouter();

  if (loading) {
    return <p className="text-white">Cargando rutas...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Mis hojas de ruta</h1>

      <div className="grid gap-5">
        {routeSheets.map((route) => (
          <RouteSheetCard
            key={route.routeSheetId}
            routeSheet={route}
            onClick={() =>
              router.push(`/collector/routes/${route.routeSheetId}`)
            }
          />
        ))}
      </div>
    </div>
  );
}
