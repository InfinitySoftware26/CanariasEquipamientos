"use client";

import { Client } from "@/types/cretateClient.type";
import { useRouter } from "next/navigation";

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <p className="text-white">{value}</p>
    </div>
  );
}

export function ClientCard({ client }: { client: Client }) {
  const router = useRouter();

  const clientStatus =
    client.supportDni && client.supportBill && client.supportVisit
      ? "COMPLETE"
      : client.supportDni || client.supportBill || client.supportVisit
        ? "PARTIAL"
        : "PENDING";

  const statusColorMap: Record<string, string> = {
    COMPLETE: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
    PARTIAL: "text-amber-300 border-amber-500/30 bg-amber-500/10",
    PENDING: "text-red-300 border-red-500/30 bg-red-500/10",
  };

  const statusLabelMap: Record<string, string> = {
    COMPLETE: "Documentación completa",
    PARTIAL: "Documentación parcial",
    PENDING: "Sin documentación",
  };

  const color = statusColorMap[clientStatus];
  const label = statusLabelMap[clientStatus];

  return (
    <article
      onClick={() => router.push(`/client/${client.clientId}`)}
      className={`rounded-3xl border p-6 transition-all duration-300 cursor-pointer hover:bg-white/5 hover:scale-[1.01] ${color}`}
    >
      <div className="flex justify-between gap-6">
        <div className="space-y-5 flex-1">
          <div>
            <Info
              label="Cliente"
              value={`${client.name ?? ""} ${client.surname ?? ""}`}
            />

            <Info label="DNI" value={client.documentNumber ?? "-"} />

            <Info label="Teléfono" value={client.phone ?? "-"} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Info label="Dirección" value={client.address ?? "-"} />
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${color}`}
          >
            {label}
          </span>

          {client.supportDni && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              DNI
            </span>
          )}

          {client.supportBill && (
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
              Factura
            </span>
          )}

          {client.supportVisit && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              Visita
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
