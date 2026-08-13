"use client";

import Link from "next/link";

import { Settlement } from "@/types/settlements/settlement.types";

interface Props {
  settlement: Settlement;
}

const STATUS_LABELS: Record<Settlement["status"], string> = {
  pending: "Pendiente",
  validated: "Aprobada",
  rejected: "Rechazada",
};

const STATUS_STYLES: Record<Settlement["status"], string> = {
  pending: "bg-[#F5A300]/15 text-[#F5A300]",
  validated: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
};

// El backend no expone el nombre del cobrador en la liquidación; se muestra
// el id truncado hasta que el endpoint lo incluya (deuda técnica).
function truncateId(id: string) {
  return `${id.slice(0, 8)}...`;
}

function outstandingColor(outstandingDebt: number) {
  if (outstandingDebt > 0) return "text-red-400";
  if (outstandingDebt < 0) return "text-[#F5A300]";
  return "text-green-400";
}

export function SettlementRow({ settlement }: Props) {
  return (
    <tr className="border-b border-white/5 transition hover:bg-white/5">
      <td className="px-6 py-4 text-white/80">
        {new Date(settlement.settlementDate).toLocaleDateString()}
      </td>

      <td className="px-6 py-4 text-white/80">
        {truncateId(settlement.staffId)}
      </td>

      <td className="px-6 py-4 text-white/80">
        $ {Number(settlement.amountDue).toLocaleString()}
      </td>

      <td className="px-6 py-4 text-white/80">
        $ {Number(settlement.amountCollected).toLocaleString()}
      </td>

      <td
        className={`px-6 py-4 font-semibold ${outstandingColor(settlement.outstandingDebt)}`}
      >
        $ {Number(settlement.outstandingDebt).toLocaleString()}
      </td>

      <td className="px-6 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[settlement.status]}`}
        >
          {STATUS_LABELS[settlement.status]}
        </span>
      </td>

      <td className="px-6 py-4">
        <Link
          href={`/settlements/${settlement.settlementId}`}
          className="rounded-lg bg-[#F5A300] px-3 py-2 text-sm font-medium text-black transition hover:opacity-90"
        >
          Ver
        </Link>
      </td>
    </tr>
  );
}
