"use client";

import { useParams } from "next/navigation";

import { useRouteSheet } from "@/hooks/route-sheets/useRouteSheet";

import { RouteSheetItemCard } from "@/components/route-sheets/RouteSheetItemCard";
import { useRouteSheetItems } from "@/hooks/route-sheets/useRouteSheetsItems";

export default function CollectorRouteSheetDetailPage() {
  const params = useParams();

  const routeSheetId = params.id as string;

  const {
    routeSheet,
    loading: loadingSheet,
    error: sheetError,
  } = useRouteSheet(routeSheetId);

  const {
    items,
    loading: loadingItems,
    reload,
  } = useRouteSheetItems(routeSheetId);

  if (loadingSheet || loadingItems) {
    return <div className="text-white">Cargando hoja de ruta...</div>;
  }

  if (sheetError || !routeSheet) {
    return (
      <div className="text-red-400">No se pudo cargar la hoja de ruta.</div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <section
        className="
        rounded-3xl
        border
        border-white/10
        bg-gradient-to-r
        from-[#10254A]
        via-[#16315F]
        to-[#21457A]
        p-8
        "
      >
        <h1 className="text-3xl font-bold text-white">Hoja de ruta</h1>

        <div className="mt-4 space-y-2 text-white/70">
          <p>
            Fecha:
            <span className="ml-2 text-white">{routeSheet.routeDate}</span>
          </p>

          <p>
            Zona:
            <span className="ml-2 text-white">
              {routeSheet.zoneName ?? routeSheet.zoneId}
            </span>
          </p>

          <p>
            Estado:
            <span className="ml-2 text-white">{routeSheet.status}</span>
          </p>
        </div>
      </section>

      {/* ITEMS */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Recorrido del día</h2>

        {items.length === 0 && (
          <div
            className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-6
            text-white/60
            "
          >
            No hay visitas pendientes.
          </div>
        )}

        <div className="grid gap-5">
          {items.map((item) => (
            <RouteSheetItemCard
              key={item.itemId}
              item={item}
              onAction={() => {
                console.log("Ejecutar item:", item);
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
