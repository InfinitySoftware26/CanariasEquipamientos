import { ClientApiResponse } from "@/types/clientResponse.type";

export function normalizeClientResponse(client: ClientApiResponse) {
  const raw = client?.client ?? client?.data ?? client?.found ?? client;

  const clientId = raw?.clientId ?? raw?.client_id ?? raw?.id;

  if (!clientId) {
    console.error("RESPUESTA INVALIDA CLIENTE:", client);
    throw new Error("Cliente sin ID válido");
  }

  return {
    clientId,
    name: raw?.name ?? "",
    surname: raw?.surname ?? "",
    documentNumber: raw?.documentNumber ?? "",
    address: raw?.address ?? "",
    phone: raw?.phone ?? "",
    observations: raw?.observations,
  };
}
