"use client";

import Link from "next/link";

import { DailyClosure } from "@/types/closures/closure.types";

interface Props {
  closure: DailyClosure;
}

const STATUS_LABELS: Record<DailyClosure["status"], string> = {
  pending: "Pendiente",
  validated: "Aprobado",
  rejected: "Rechazado",
};

const STATUS_STYLES: Record<DailyClosure["status"], string> = {
  pending: "bg-[#F5A300]/15 text-[#F5A300]",
  validated: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
};

export function ClosureRow({ closure }: Props) {
  return (
    <tr className="border-b border-white/5 transition hover:bg-white/5">
      <td className="px-6 py-4 text-white/80">
        {new Date(closure.closingDate).toLocaleDateString()}
      </td>

      <td className="px-6 py-4 text-white/80">
        {closure.staff ? `${closure.staff.name} ` : "Cobrador no disponible"}
      </td>

      <td className="px-6 py-4 font-semibold text-white">
        ${Number(closure.totalCollected).toLocaleString()}
      </td>

      <td className="px-6 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            STATUS_STYLES[closure.status]
          }`}
        >
          {STATUS_LABELS[closure.status]}
        </span>
      </td>

      <td className="px-6 py-4">
        <Link
          href={`/closures/${closure.closureId}`}
          className="rounded-lg bg-[#F5A300] px-3 py-2 text-sm font-medium text-black transition hover:opacity-90"
        >
          Ver
        </Link>
      </td>
    </tr>
  );
}
