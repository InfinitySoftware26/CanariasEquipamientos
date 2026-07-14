import { apiFetch } from "../apiFetch.service";
import { useAuthStore } from "@/store/auth.store";

export interface Staff {
  staffId: string;
  name: string;
  email: string;
  role: string;
}

export async function getAssignableStaff() {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch("/staff", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error obteniendo personal");
  }

  const json = await res.json();

  const data = Array.isArray(json) ? json : (json.data ?? []);

  console.log(data);

  return data.filter(
    (staff: Staff) => staff.role === "vendedor" || staff.role === "cobrador",
  );
}
