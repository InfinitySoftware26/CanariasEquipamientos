"use client";

import { Client } from "@/types/cretateClient.type";
import { useRouter } from "next/navigation";
import { useState } from "react";

function getStatus(client: Client) {
  if (client.supportDni && client.supportBill && client.supportVisit) {
    return {
      label: "Completo",
      className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    };
  }

  if (client.supportDni || client.supportBill || client.supportVisit) {
    return {
      label: "Parcial",
      className: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    };
  }

  return {
    label: "Pendiente",
    className: "bg-red-500/10 text-red-300 border-red-500/20",
  };
}

export function ClientCard({ client }: { client: Client }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const status = getStatus(client);

  const fullName = `${client.name ?? ""} ${client.surname ?? ""}`.trim();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/client/${client.clientId}/edit`);
  };

  const handleDisable = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const ok = confirm("¿Querés desactivar este cliente?");
    if (!ok) return;

    setLoading(true);

    try {
      // acá después conectamos endpoint real
      console.log("disable client", client.clientId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article
      onClick={() => router.push(`/client/${client.clientId}`)}
      className="
        group cursor-pointer
        rounded-2xl border border-white/10
        bg-[#0E1726]
        p-5
        transition-all
        hover:bg-white/5
        hover:border-white/20
      "
    >
      <div className="flex items-start justify-between gap-6">
        {/* LEFT */}
        <div className="space-y-3">
          <div>
            <p className="text-lg font-semibold text-white">{fullName}</p>
            <p className="text-xs text-white/50">
              DNI: {client.documentNumber ?? "-"}
            </p>
          </div>

          <div className="space-y-1 text-sm text-white/70">
            <p>📞 {client.phone ?? "-"}</p>
            <p>📍 {client.address ?? "-"}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-end gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>

          <div className="flex flex-wrap justify-end gap-2">
            {client.supportDni && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">
                DNI
              </span>
            )}

            {client.supportBill && (
              <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] text-blue-300">
                Factura
              </span>
            )}

            {client.supportVisit && (
              <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] text-amber-300">
                Visita
              </span>
            )}
          </div>

          {/* ACTIONS */}
          <div
            className="
              flex gap-2 opacity-0 transition
              group-hover:opacity-100
            "
          >
            <button
              onClick={handleEdit}
              className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
            >
              Editar
            </button>

            <button
              onClick={handleDisable}
              disabled={loading}
              className="rounded-lg bg-red-500/10 px-3 py-1 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-40"
            >
              Desactivar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
