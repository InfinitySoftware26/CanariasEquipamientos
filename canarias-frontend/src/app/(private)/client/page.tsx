"use client";

import { ClientsBySeller } from "@/components/client/ClientBySeller";
import { ClientFilters } from "@/components/client/ClientFilter";
import { ClientList } from "@/components/client/ClientList";
import { useClients } from "@/hooks/clients/useClient";

export default function ClientsPage() {
  const { clients, clientsBySeller, loading, error, search, setSearch } =
    useClients();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Clientes</h1>

        <p className="mt-1 text-white/50">Administración de clientes</p>
      </div>

      <ClientFilters search={search} onSearch={setSearch} />

      <ClientList clients={clients} loading={loading} error={error} />

      <ClientsBySeller
        grouped={clientsBySeller}
        loading={loading}
        error={error}
      />
    </div>
  );
}
