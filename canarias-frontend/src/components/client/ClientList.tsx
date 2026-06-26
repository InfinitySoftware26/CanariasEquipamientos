import { Client } from "@/types/cretateClient.type";
import { ClientCard } from "./ClientCard";

interface Props {
  clients?: Client[];
  loading: boolean;
  error?: string;
}

export function ClientList({ clients, loading, error }: Props) {
  const safeClients = clients ?? [];

  if (loading) {
    return <p className="text-white/50">Cargando clientes...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (safeClients.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
        <p className="text-white/40">No hay clientes registrados</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      {safeClients.map((client) => (
        <ClientCard key={client.clientId} client={client} />
      ))}
    </section>
  );
}
