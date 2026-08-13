"use client";

import { DailyClosure } from "@/types/closures/closure.types";
import { ClosureRow } from "./ClosureRow";

interface Props {
  closures: DailyClosure[];
}

export function ClosureList({ closures }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0E1726]">
      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr className="text-left text-xs uppercase tracking-wider text-white/50">
              <th className="px-6 py-4">Fecha</th>

              <th className="px-6 py-4">Cobrador</th>

              <th className="px-6 py-4">Declarado</th>

              <th className="px-6 py-4">Estado</th>

              <th className="px-6 py-4"></th>
            </tr>
          </thead>

          <tbody>
            {closures.map((closure) => (
              <ClosureRow key={closure.closureId} closure={closure} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
