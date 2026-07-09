"use client";

import { useState } from "react";

import { ClientTable } from "@/components/client/ClientTable";
import { useClients } from "@/hooks/clients/useClient";
import { ClientFilters } from "@/components/client/ClientFilter";

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const { clients, loading, error } = useClients({
    search,
  });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-white">Clientes</h1>

        <p className="mt-2 text-white/60">Gestión y seguimiento de clientes.</p>
      </section>

      <ClientFilters search={search} onSearch={setSearch} />

      {loading && <p className="text-white/60">Cargando clientes...</p>}

      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && <ClientTable clients={clients} />}
    </div>
  );
}
