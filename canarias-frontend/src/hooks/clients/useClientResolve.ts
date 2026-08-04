import { useState } from "react";
import { searchClientByDocument } from "@/services/client.service";
import { createPreloadClient } from "@/services/client.service";
import { Client, CreatePreloadClientDto } from "@/types/cretateClient.type";

interface ResolverInput {
  documentNumber: string;
  name?: string;
  surname?: string;
  phone?: string;
  address?: string;
}

export function useClientResolver() {
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState<Client | null>(null);

  const resolveClient = async (data: ResolverInput): Promise<Client> => {
    setLoading(true);

    try {
      const found = await searchClientByDocument(data.documentNumber);

      if (found) {
        setClient(found);
        return found;
      }

      const payload: CreatePreloadClientDto = {
        name: data.name ?? "",
        surname: data.surname ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        documentNumber: data.documentNumber,
        zoneId: undefined,
        nameReference1: "",
        telReference1: "",
        addressReference1: "",
        nameReference2: "",
        telReference2: "",
        addressReference2: "",
        supportDni: false,
        supportBill: false,
        supportVisit: false,
      };

      const created = await createPreloadClient(payload);

      setClient(created);
      return created;
    } finally {
      setLoading(false);
    }
  };

  return {
    resolveClient,
    loading,
    client,
  };
}
