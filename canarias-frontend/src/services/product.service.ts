import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "./apiFetch.service";

export async function getProducts() {
  const token = useAuthStore.getState().accessToken;
  console.log("TOKEN PRODUCTOS:", token);
  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const res = await apiFetch("/products", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error obteniendo productos: ${text}`);
  }

  const json = await res.json();

  return json.data ?? [];
}
