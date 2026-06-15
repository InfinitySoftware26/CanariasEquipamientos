import { CreateClientPayload } from "@/types/cretateClient.type";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://canarias-backend.onrender.com/api/v1"
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1");

export async function createPreloadClient(data: CreateClientPayload) {
  const res = await fetch(`${API_URL}/clients/preload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error creando cliente");

  return res.json();
}

export async function getClientById(id: string) {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

// services/client.service.ts

export async function searchClientByDocument(documentNumber: string) {
  const res = await fetch(
    `${API_URL}/clients/search?documentNumber=${documentNumber}`,
    {
      credentials: "include",
    },
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
}
