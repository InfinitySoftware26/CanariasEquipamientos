"use client";

import { RouteSheetItem } from "@/types/rotue-sheets/routeSheets.types";

interface Props {
  item: RouteSheetItem;
  onAction?: () => void;
}

export function RouteSheetItemCard({ item, onAction }: Props) {
  return (
    <article
      className="
rounded-3xl
border
border-white/10
bg-white/5
p-5
space-y-4
"
    >
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-white/40">Cliente</p>

          <p className="font-semibold">{item.clientId}</p>
        </div>

        <span
          className="
rounded-full
bg-white/10
px-3
py-1
text-xs
"
        >
          {item.itemType === "INSTALLMENT" ? "Cuota" : "Entrega"}
        </span>
      </div>

      <div className="text-sm">
        Resultado:
        <span className="font-semibold ml-2">{item.result}</span>
      </div>

      {item.collectedAmount && (
        <p>
          Cobrado:
          <strong>${item.collectedAmount}</strong>
        </p>
      )}

      {item.result === "PENDING" && (
        <button
          onClick={onAction}
          className="
rounded-xl
bg-yellow-600
px-4
py-2
"
        >
          Registrar visita
        </button>
      )}
    </article>
  );
}
