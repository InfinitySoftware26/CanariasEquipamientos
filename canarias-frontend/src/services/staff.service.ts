import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "./apiFetch.service";
import { CreateStaffPayload } from "../types/staff/createStaff.type";
import { Staff } from "../types/staff/staff.type";
import { StaffResponse } from "../types/staff/staffResponse.type";
import { UpdateStaffPayload } from "@/types/staff/updateStaff.type";

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

  const data = json.data ?? json;

  return data.map((employee: StaffResponse) => ({
    ...employee,
    id: employee.staffId,
  }));
}

export async function getCollectors(): Promise<Staff[]> {
  const staff = await getStaff();

  return staff.filter((person) => person.role === "cobrador");
}

export async function getStaffById(id: string): Promise<Staff> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const res = await apiFetch(`/staff/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error obteniendo empleado");
  }

  const json = await res.json();

  const employee: StaffResponse = json.data ?? json;

  return {
    ...employee,
    id: employee.staffId,
  };
}

export async function updateStaff(
  id: string,
  data: UpdateStaffPayload,
): Promise<Staff> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const res = await apiFetch(`/staff/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();

    console.error("ERROR BACKEND UPDATE STAFF");
    console.error(error);

    throw new Error(error || "Error actualizando empleado");
  }

  const json = await res.json();

  const employee: StaffResponse = json.data ?? json;

  return {
    ...employee,
    id: employee.staffId,
  };
}

export async function deactivateStaff(id: string): Promise<void> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const res = await apiFetch(`/staff/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error desactivando empleado");
  }
}
export async function getAssignableStaff(): Promise<Staff[]> {
  const staff = await getStaff();

  return staff.filter(
    (person) => person.role === "vendedor" || person.role === "cobrador",
  );
}
