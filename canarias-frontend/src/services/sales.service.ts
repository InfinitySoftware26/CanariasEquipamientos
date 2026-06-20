import { useAuthStore } from "@/store/auth.store";
import { CreateSalePayload } from "@/types/createSale.type";
import { apiFetch } from "./apiFetch.service";

export async function createSale(data: CreateSalePayload) {
  const res = await apiFetch("/sales", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("SALE ERROR:", error);
    throw new Error(JSON.stringify(error));
  }

  return res.json();
}

export async function getMySales() {
  const token = useAuthStore.getState().accessToken;
   if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch("/sales/my", {
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
