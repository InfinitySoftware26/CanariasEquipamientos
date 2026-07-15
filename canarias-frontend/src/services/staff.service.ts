import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "./apiFetch.service";

import { CreateStaffPayload } from "../types/staff/createStaff.type";
import { Staff } from "../types/staff/staff.type";

export async function createStaff(data: CreateStaffPayload): Promise<Staff> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const res = await apiFetch("/staff", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Error creando empleado");
  }

  const json = await res.json();

  return json.data ?? json;
}

export async function getStaff(): Promise<Staff[]> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const res = await apiFetch("/staff", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error obteniendo empleados");
  }

  const json = await res.json();

  return json.data ?? json;
}

export async function getCollectors(): Promise<Staff[]> {
  const staff = await getStaff();

  return staff.filter((person) => person.role === "cobrador");
}
