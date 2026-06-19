import { apiFetch } from "./apiFetch.service";

export async function getSellerDashboard() {
  const res = await apiFetch("/dashboard/seller", {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Error al obtener datos del dashboard");

  return res.json();
}
