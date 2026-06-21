import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";

export async function getCollectors() {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch("/staff", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error obteniendo staff");
  }

  const json = await res.json();

  const staff = json.data ?? json;

  return staff.filter((person: { role: string }) => person.role === "cobrador");
}

export async function getCollectorById(id: string) {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch(`/staff/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error obteniendo cobrador");
  }

  const json = await res.json();

  return json.data ?? json;
}
