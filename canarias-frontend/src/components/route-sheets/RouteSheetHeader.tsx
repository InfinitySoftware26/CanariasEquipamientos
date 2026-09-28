"use client";

import { Calendar, MapPin, User } from "lucide-react";

import {
  RouteSheetDetail,
  RouteSheetStatus,
} from "@/types/rotue-sheets/routeSheets.types";

import { RouteSheetStatusBadge } from "./RouteSheetStatusBadge";

interface Props {
  routeSheet: RouteSheetDetail;

  onStatusChange?: (status: RouteSheetStatus) => void;
}

export function RouteSheetHeader({ routeSheet, onStatusChange }: Props) {
  return (
    <section
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50">Hoja de Ruta</p>

          <h1 className="mt-1 text-3xl font-bold">{routeSheet.routeDate}</h1>
        </div>

        <RouteSheetStatusBadge status={routeSheet.status} />
      </div>

      <div
        className="
          mt-8
          grid
          gap-6
          md:grid-cols-3
        "
      >
        <div className="flex items-center gap-3">
          <MapPin className="text-cyan-400" />

          <div>
            <p className="text-xs text-white/40">Zona</p>

            <p>{routeSheet.zoneName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <User className="text-cyan-400" />

          <div>
            <p className="text-xs text-white/40">Cobrador</p>

            <p>{routeSheet.staffName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="text-cyan-400" />

          <div>
            <p className="text-xs text-white/40">Fecha recorrido</p>

            <p>{routeSheet.routeDate}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        {routeSheet.status === RouteSheetStatus.PENDING && (
          <button
            onClick={() => onStatusChange?.(RouteSheetStatus.IN_PROGRESS)}
            className="
              rounded-xl
              bg-cyan-600
              px-5
              py-3
              font-medium
              transition
              hover:bg-cyan-500
            "
          >
            Iniciar recorrido
          </button>
        )}

        {routeSheet.status === RouteSheetStatus.IN_PROGRESS && (
          <button
            onClick={() => onStatusChange?.(RouteSheetStatus.COMPLETED)}
            className="
              rounded-xl
              bg-emerald-600
              px-5
              py-3
              font-medium
              transition
              hover:bg-emerald-500
            "
          >
            Finalizar recorrido
          </button>
        )}
      </div>
    </section>
  );
}
