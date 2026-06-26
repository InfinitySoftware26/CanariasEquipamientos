"use client";

import { ClientList } from "@/components/client/ClientList";
import { useClients } from "@/hooks/clients/useClient";

export default function ClientsPage() {
  const { clients, loading, error } = useClients();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">Clientes</h1>

        <p className="mt-1 text-white/50">Administración de clientes</p>
      </header>

      <ClientList clients={clients} loading={loading} error={error} />
    </div>
  );
}
