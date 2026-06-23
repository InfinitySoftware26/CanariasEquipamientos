import { ClientApiResponse, ClientResponse } from "@/types/clientResponse.type";

export function normalizeClientResponse(
  client: ClientApiResponse,
): ClientResponse {
  const raw = typeof client === "object" && client !== null ? client : {};

  const source = raw.client ?? raw.data ?? raw;

  const clientId = source.clientId ?? source.client_id ?? source.id;

  if (!clientId) {
    console.error("RESPUESTA INVALIDA CLIENTE:", client);
    throw new Error("Cliente sin ID válido");
  }

  return {
    clientId,
    name: source.name ?? "",
    surname: source.surname ?? "",
    documentNumber: source.documentNumber ?? "",
    address: source.address ?? "",
    phone: source.phone ?? "",
    observations: source.observations,
  };
}
