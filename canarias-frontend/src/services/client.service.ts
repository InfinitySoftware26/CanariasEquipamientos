import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "./apiFetch.service";

import {
  Client,
  ClientLookupResponse,
  ClientsResponse,
  CreateClientPayload,
} from "@/types/cretateClient.type";

// CREATE PRELOAD
export async function createPreloadClient(
  data: CreateClientPayload,
): Promise<Client> {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch("/clients/preload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Error creando cliente");
  }

  const json = await res.json();
  console.log("CREATE CLIENT RESPONSE:", json);

  return json?.data ?? json;
}

// GET BY ID
export async function getClientById(id: string): Promise<Client | null> {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch(`/clients/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;

  const json = await res.json();

  return json.data ?? json;
}

// LOOKUP
export async function searchClientByDocument(
  documentNumber: string,
): Promise<ClientLookupResponse | null> {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch(
    `/clients/lookup?documentNumber=${documentNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Error buscando cliente");
  }

  const client = await res.json();

  console.log("LOOKUP CLIENT RESPONSE:", client);

  return {
    ...client,
    clientId: client.clientId,
    alreadyInCurrentSociety: client.alreadyInCurrentSociety ?? false,
  };
}

// LIST
export async function listClients(params?: {
  page?: number;
  perPage?: number;
  name?: string;
  societyId?: string;
}): Promise<ClientsResponse> {
  const token = useAuthStore.getState().accessToken;

  const query = new URLSearchParams();

  if (params?.page) {
    query.append("page", String(params.page));
  }

  if (params?.perPage) {
    query.append("perPage", String(params.perPage));
  }

  if (params?.name) {
    query.append("name", params.name);
  }

  if (params?.societyId) {
    query.append("societyId", params.societyId);
  }

  const res = await apiFetch(`/clients?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error obteniendo clientes");
  }

  const json = await res.json();

  console.log("CLIENTS RESPONSE:", json);

  return json.data;
}

// UPDATE
export async function updateClient(id: string, data: Partial<Client>) {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch(`/clients/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Error actualizando cliente");
  }

  return res.json();
}

// HISTORY
export async function getClientHistory(id: string) {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch(`/clients/${id}/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error obteniendo historial");
  }

  return res.json();
}

// REQUEST VERIFICATION
export async function requestClientVerification(id: string, note: string) {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch(`/clients/${id}/request-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ note }),
  });

  if (!res.ok) {
    throw new Error("Error solicitando verificación");
  }

  return res.json();
}
