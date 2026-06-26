import { useEffect, useState, useCallback } from "react";
import { listClients } from "@/services/client.service";
import { Client } from "@/types/cretateClient.type";
import { useAuthStore } from "@/store/auth.store";
import { StaffRole } from "@/types/auth.types";

interface UseClientsProps {
  search?: string;
}

export function useClients({ search = "" }: UseClientsProps = {}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const selectedSocietyId = useAuthStore((s) => s.selectedSocietyId);
  const user = useAuthStore((s) => s.user);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const data = await listClients({
        page: 1,
        perPage: 50,
        name: search || undefined,

        societyId:
          user?.role === StaffRole.SUPER_ADMIN
            ? (selectedSocietyId ?? undefined)
            : undefined,
      });

      setClients(data.items ?? []);
    } catch (err) {
      console.error(err);
      setClients([]);
      setError("Error cargando clientes");
    } finally {
      setLoading(false);
    }
  }, [search, selectedSocietyId]);

  useEffect(() => {
    if (!hydrated || !token) return;

    loadClients();
  }, [hydrated, token, loadClients]);

  return {
    clients,
    loading,
    error,
    reload: loadClients,
  };
}
