"use client";

import { ClientTable } from "@/components/client/ClientTable";
import { useClients } from "@/hooks/clients/useClient";

export default function ClientsPage() {
  const { clients, loading, error } = useClients();

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <section>
        <h1 className="text-3xl font-bold text-white">Clientes</h1>
        <p className="mt-2 text-white/60">Gestión y seguimiento de clientes.</p>
      </section>

      {/* LIST */}
      <section className="space-y-4">
        {loading && <p className="text-white/60">Cargando clientes...</p>}

        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && clients?.length > 0 && (
          <ClientTable clients={clients} />
        )}

        {!loading && !error && clients?.length === 0 && (
          <p className="text-white/50">No hay clientes.</p>
        )}
      </section>
    </div>
  );
}
