"use client";

import { Client } from "@/types/cretateClient.type";
import { ClientCard } from "./ClientCard";

interface Props {
  clients: Client[];
  loading: boolean;
  error?: string;
}

export function ClientsBySeller({ clients, loading, error }: Props) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="text-white/60">Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
        <p className="text-white/40">No hay clientes registrados</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {clients.map((client) => (
        <ClientCard key={client.clientId} client={client} />
      ))}
    </section>
  );
}
