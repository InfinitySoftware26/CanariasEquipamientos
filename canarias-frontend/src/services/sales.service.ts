import { useAuthStore } from "@/store/auth.store";
import { CreateSalePayload } from "@/types/createSale.type";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://canarias-backend.onrender.com/api/v1"
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1");

export async function createSale(data: CreateSalePayload) {
  const res = await fetch(`${API_URL}/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Error creando venta");
  }

  return res.json();
}

export async function getMySales() {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${API_URL}/sales/my`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("STATUS:", res.status);

  if (!res.ok) {
    const error = await res.text();
    console.log("ERROR:", error);
    throw new Error(`Error ${res.status}`);
  }

  return res.json();
}
