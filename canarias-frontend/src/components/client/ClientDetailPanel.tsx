"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";

import { updateClient } from "@/services/client.service";
import { ClientEditModal } from "./ClientEditModal";
import { ClientView } from "@/types/cretateClient.type";

export function ClientDetailPanel({ client }: { client: ClientView }) {
  const [open, setOpen] = useState(false);
  const [isActive, setIsActive] = useState(client.isActive);

  const selectedSociety = useAuthStore((s) => s.selectedSociety);

  const societyName =
    client.societyId && selectedSociety?.id === client.societyId
      ? selectedSociety.name
      : "Sin sociedad";

  const toggleStatus = async () => {
    await updateClient(client.clientId, {
      observations: isActive ? "Desactivado" : "Activo",
    });

    setIsActive((p) => !p);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0E1726] shadow-xl">
      {/* HEADER / IDENTIDAD */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Nombre */}
          <div>
            <h2 className="text-lg font-semibold text-white">
              {client.name} {client.surname}
            </h2>

            <p className="text-white/50 text-sm mt-1">
              Documento:{" "}
              <span className="text-white/80">
                {client.documentNumber ?? "-"}
              </span>
            </p>

            <p className="text-white/40 text-xs mt-1">
              Sociedad: <span className="text-white/70">{societyName}</span>
            </p>
          </div>

          {/* Estado */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              isActive
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                : "bg-red-500/10 text-red-300 border-red-500/20"
            }`}
          >
            {isActive ? "Activo" : "Inactivo"}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6 space-y-6 text-sm">
        {/* CONTACTO */}
        <div className="grid gap-3">
          <div className="rounded-2xl bg-[#0B1220] border border-white/5 p-4">
            <p className="text-white/40 text-xs">Teléfono</p>
            <p className="text-white mt-1">{client.phone ?? "-"}</p>
          </div>

          <div className="rounded-2xl bg-[#0B1220] border border-white/5 p-4">
            <p className="text-white/40 text-xs">Dirección</p>
            <p className="text-white mt-1">{client.address ?? "-"}</p>
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div className="rounded-2xl bg-[#0B1220] border border-white/5 p-4">
          <p className="text-white/40 text-xs mb-2">Observaciones</p>
          <p className="text-white/80 leading-relaxed">
            {client.observations ?? "Sin observaciones"}
          </p>
        </div>

        {/* ACCIONES */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-[#F5A300] px-4 py-2 text-black font-medium hover:brightness-110 transition"
          >
            Editar
          </button>

          <button
            onClick={toggleStatus}
            className="rounded-xl border border-white/10 px-4 py-2 text-white hover:bg-white/5 transition"
          >
            {isActive ? "Desactivar" : "Activar"}
          </button>
        </div>
      </div>

      {open && (
        <ClientEditModal client={client} onClose={() => setOpen(false)} />
      )}
    </section>
  );
}
