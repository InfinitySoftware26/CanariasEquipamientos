"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getClientById } from "@/services/client.service";
import { ClientDetailPanel } from "@/components/client/ClientDetailPanel";
import { ClientView } from "@/types/cretateClient.type";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [client, setClient] = useState<ClientView | null>(null);

  useEffect(() => {
    if (!id) return;

    getClientById(id).then((data) => {
      if (!data) return;

      setClient({
        ...data,

        // Como el backend no posee estado del cliente,
        // simulamos activo mientras no exista ese campo.
        isActive: true,

        // Tampoco existe el nombre de la sociedad.
        // mostramos el id por ahora.
        societyName: data.createdBySocietyName ?? "Sin sociedad",
      });
    });
  }, [id]);
  if (!client) {
    return <p className="text-white/60">Cargando...</p>;
  }

  return <ClientDetailPanel client={client} />;
}
