import { useAuthStore } from "@/store/auth.store";
import { CreateClientPayload } from "@/types/cretateClient.type";
import { apiFetch } from "./apiFetch.service";
import { normalizeClientResponse } from "@/utils/client/normalizeClient";

export async function createPreloadClient(data: CreateClientPayload) {
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
    const error = await res.text();
    throw new Error(error || "Error creando cliente");
  }

  const dataRes = await res.json();

  return normalizeClientResponse(dataRes);
}

export async function getClientById(id: string) {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch(`/clients/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

// services/client.service.ts

export async function searchClientByDocument(documentNumber: string) {
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

  return res.json();
}
