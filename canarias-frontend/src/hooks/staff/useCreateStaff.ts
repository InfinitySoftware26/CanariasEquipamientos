"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStaff } from "@/services/staff.service";
import { CreateStaffPayload } from "../../types/staff/createStaff.type";
import { StaffRole } from "@/types/auth.types";
import { useAuthStore } from "@/store/auth.store";

const initialForm: CreateStaffPayload = {
  name: "",
  dni: "",
  email: "",
  password: "",
  role: StaffRole.SELLER,
};

export function useCreateStaff() {
  const router = useRouter();
  const selectedSocietyId = useAuthStore((state) => state.selectedSocietyId);
  const [form, setForm] = useState<CreateStaffPayload>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    try {
      setLoading(true);
      setError(null);

      const payload: CreateStaffPayload = {
        ...form,
        societyId: selectedSocietyId ?? undefined,
      };

      console.log("Payload:", payload);

      await createStaff(payload);

      router.push("/staff");
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el empleado");
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    setForm,

    loading,
    error,

    handleSubmit,
  };
}
