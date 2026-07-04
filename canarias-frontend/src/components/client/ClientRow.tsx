"use client";

import { useRouter } from "next/navigation";
import { Client } from "@/types/cretateClient.type";
import { getDisplayCode } from "@/lib/sales/displayCode";

export function ClientRow({ client }: { client: Client }) {
  const router = useRouter();

  const clientStatus =
    client.supportDni && client.supportBill && client.supportVisit
      ? "COMPLETE"
      : client.supportDni || client.supportBill || client.supportVisit
        ? "PARTIAL"
        : "PENDING";

  const status =
    clientStatus === "COMPLETE"
      ? { label: "Completo", color: "text-emerald-300" }
      : clientStatus === "PARTIAL"
        ? { label: "Parcial", color: "text-amber-300" }
        : { label: "Pendiente", color: "text-red-300" };

  return (
    <tr
      onClick={() => router.push(`/client/${client.clientId}`)}
      className="cursor-pointer border-b border-white/5 transition-all hover:bg-white/5"
    >
      <td className="py-4 px-3">
        <span className="inline-block text-yellow-400 text-sm sm:text-base font-semibold tracking-widest">
          {getDisplayCode("CLI", client.clientId)}
        </span>
      </td>
      {/* NAME */}
      <td className="py-4 px-3">
        <span className="text-white font-semibold text-sm sm:text-base tracking-wide">
          {client.name} {client.surname}
        </span>
      </td>

      {/* DOCUMENT */}
      <td className="px-3 py-3 text-xs whitespace-nowrap md:px-6 md:py-5 md:text-sm">
        {client.documentNumber ?? "-"}
      </td>

      {/* PHONE */}
      <td className="px-3 py-3 text-xs whitespace-nowrap md:px-6 md:py-5 md:text-sm">
        {client.phone ?? "-"}
      </td>

      {/* ADDRESS (igual que product en SalesRow: truncate) */}
      <td className="max-w-[140px] px-3 py-3 text-xs md:max-w-none md:px-6 md:py-5 md:text-sm">
        <span className="block truncate">{client.address ?? "-"}</span>
      </td>

      {/* STATUS (igual estética que badge de Sales) */}
      <td
        className={`px-3 py-3 text-xs md:px-6 md:py-5 md:text-sm font-semibold ${status.color}`}
      >
        {status.label}
      </td>

      {/* ARROW */}
      <td className="px-3 py-3 text-center md:px-6 md:py-5">
        <span className="text-white/40">›</span>
      </td>
    </tr>
  );
}
