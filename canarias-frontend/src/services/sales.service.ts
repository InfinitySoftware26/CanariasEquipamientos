import { CreateSalePayload } from "@/types/createSale.type";
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://canarias-backend.onrender.com/api/v1"
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1");

export async function createSale(data: CreateSalePayload) {
  const res = await fetch(`${API_URL}/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error creando venta");

  return res.json();
}

export async function getSellerKpis(societyId: string) {
  const res = await fetch(`${API_URL}/sales/dashboard?societyId=${societyId}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Error al obtener identificacion de Sociedad");

  return res.json();
}
