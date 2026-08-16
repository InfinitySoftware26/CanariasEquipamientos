import { useState } from "react";
import { searchClientByDocument, createPreloadClient } from "@/services/client.service";
import { Client, CreatePreloadClientDto } from "@/types/cretateClient.type";

interface ResolverInput {
  documentNumber: string;
  name?: string;
  surname?: string;
  phone?: string;
  address?: string;
  email?: string;

  // Referencias
  nameReference1?: string;
  telReference1?: string;
  addressReference1?: string;
  nameReference2?: string;
  telReference2?: string;
  addressReference2?: string;

  // Socioeconómicos
  profession?: string;
  monthlyIncome?: string;
  paymentMethod?: string;
  incomeDependents?: string;
  additionalIncome?: string;
  housingSituation?: string;
  contractDuration?: string;
  cuil?: string;
  activeCredit?: boolean;

  // Otros
  observations?: string;
  societyId?: string;
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
        email: data.email ?? "",
        documentNumber: data.documentNumber,
        zoneId: data.societyId ?? undefined,

        // Referencias
        nameReference1: data.nameReference1 ?? "",
        telReference1: data.telReference1 ?? "",
        addressReference1: data.addressReference1 ?? "",
        nameReference2: data.nameReference2 ?? "",
        telReference2: data.telReference2 ?? "",
        addressReference2: data.addressReference2 ?? "",

        // Socioeconómicos
        profession: data.profession ?? "",
        monthlyIncome: data.monthlyIncome ?? "",
        paymentMethod: data.paymentMethod ?? "",
        incomeDependents: data.incomeDependents ?? "",
        additionalIncome: data.additionalIncome ?? "",
        housingSituation: data.housingSituation ?? "",
        contractDuration: data.contractDuration ?? "",
        cuil: data.cuil ?? "",
        activeCredit: data.activeCredit ?? false,

        // Otros
        observations: data.observations ?? "",
        societyId: data.societyId ?? "",

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
