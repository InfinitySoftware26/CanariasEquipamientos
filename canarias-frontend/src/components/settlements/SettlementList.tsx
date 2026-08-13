"use client";

import { Settlement } from "@/types/settlements/settlement.types";
import { SettlementRow } from "./SettlementRow";

interface Props {
  settlements: Settlement[];
}

export function SettlementList({ settlements }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0E1726]">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr className="text-left text-xs uppercase tracking-wider text-white/50">
              <th className="px-6 py-4">Fecha</th>

              <th className="px-6 py-4">Cobrador</th>

              <th className="px-6 py-4">A cobrar</th>

              <th className="px-6 py-4">Cobrado</th>

              <th className="px-6 py-4">Deuda</th>

              <th className="px-6 py-4">Estado</th>

              <th className="px-6 py-4"></th>
            </tr>
          </thead>

          <tbody>
            {settlements.map((settlement) => (
              <SettlementRow
                key={settlement.settlementId}
                settlement={settlement}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
