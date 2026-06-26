import { useEffect, useState, useCallback, useMemo } from "react";
import { listClients } from "@/services/client.service";
import { Client } from "@/types/cretateClient.type";
import { useAuthStore } from "@/store/auth.store";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const selectedSocietyId = useAuthStore((s) => s.selectedSocietyId);

  const loadClients = useCallback(async (searchValue: string) => {
    try {
      setLoading(true);
      setError(undefined);

      const data = await listClients({
        page: 1,
        perPage: 50,
        name: searchValue,
      });

      setClients(data.items);
    } catch {
      setError("Error cargando clientes");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // carga inicial
  useEffect(() => {
    if (!hydrated || !token || !selectedSocietyId) return;

    loadClients("");
  }, [hydrated, token, selectedSocietyId, loadClients]);

  // search con debounce
  useEffect(() => {
    if (!hydrated || !token || !selectedSocietyId) return;

    const timeout = setTimeout(() => {
      loadClients(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, hydrated, token, selectedSocietyId, loadClients]);

  // 👇 AGRUPADO POR VENDEDOR
  const clientsBySeller = useMemo(() => {
    const safeClients = clients ?? [];

    return safeClients.reduce(
      (acc, client) => {
        const sellerId = client.createdBy || "unknown";

        if (!acc[sellerId]) {
          acc[sellerId] = {
            sellerId,
            clients: [],
            total: 0,
          };
        }

        acc[sellerId].clients.push(client);
        acc[sellerId].total += 1;

        return acc;
      },
      {} as Record<
        string,
        { sellerId: string; clients: Client[]; total: number }
      >,
    );
  }, [clients]);

  return {
    clients,
    clientsBySeller,
    loading,
    error,
    search,
    setSearch,
  };
}
