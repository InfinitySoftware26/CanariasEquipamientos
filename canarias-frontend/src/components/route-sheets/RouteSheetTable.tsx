"use client";

import { Eye } from "lucide-react";

import { RouteSheet } from "@/types/rotue-sheets/routeSheets.types";
import { RouteSheetStatusBadge } from "./RouteSheetStatusBadge";

interface Props {
  routeSheets: RouteSheet[];
  onSelect?: (item: RouteSheet) => void;
}

export function RouteSheetTable({ routeSheets, onSelect }: Props) {
  if (!routeSheets.length) {
    return (
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-10
          text-center
          text-white/50
        "
      >
        No existen hojas de ruta.
      </div>
    );
  }

  return (
    <div
      className="
overflow-x-auto
rounded-3xl
"
    >
      <table className="min-w-[700px] w-full">
        <thead className="bg-white/5">
          <tr className="text-left text-sm text-white/60">
            <th className="p-4">Fecha</th>

            <th>Zona</th>

            <th>Cobrador</th>

            <th>Estado</th>

            <th className="text-center">Acción</th>
          </tr>
        </thead>

        <tbody>
          {routeSheets.map((sheet) => (
            <tr
              key={sheet.routeSheetId}
              className="
                border-t
                border-white/10
                hover:bg-white/5
                transition
              "
            >
              <td className="p-4 font-medium">{sheet.routeDate}</td>

              <td>{sheet.zoneName}</td>

              <td>{sheet.staffName}</td>

              <td>
                <RouteSheetStatusBadge status={sheet.status} />
              </td>

              <td className="text-center">
                <button
                  onClick={() => onSelect?.(sheet)}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-cyan-600
                    px-3
                    py-2
                    text-sm
                    transition
                    hover:bg-cyan-500
                  "
                >
                  <Eye size={16} />
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
