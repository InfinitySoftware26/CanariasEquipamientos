"use client";

import { Calendar, MapPin, User } from "lucide-react";

import { RouteSheet } from "@/types/rotue-sheets/routeSheets.types";
import { RouteSheetStatusBadge } from "./RouteSheetStatusBadge";

interface Props {
  routeSheet: RouteSheet;
  onClick?: () => void;
}

export function RouteSheetCard({ routeSheet, onClick }: Props) {
  return (
    <article
      onClick={onClick}
      className="
cursor-pointer
rounded-3xl
border
border-white/10
bg-white/5
p-5
hover:bg-white/10
"
    >
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-white/40">Hoja de ruta</p>

          <h3 className="text-lg font-semibold">{routeSheet.routeDate}</h3>
        </div>

        <RouteSheetStatusBadge status={routeSheet.status} />
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex gap-3">
          <MapPin className="text-cyan-400" />

          <div>
            <p className="text-xs text-white/40">Zona</p>

            <p>{routeSheet.zoneId}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <User className="text-cyan-400" />

          <div>
            <p className="text-xs text-white/40">Cobrador</p>

            <p>{routeSheet.staffId}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Calendar className="text-cyan-400" />

          <div>
            <p className="text-xs text-white/40">Fecha</p>

            <p>{routeSheet.routeDate}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
