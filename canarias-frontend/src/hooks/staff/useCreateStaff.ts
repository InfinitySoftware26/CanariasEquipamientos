"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStaff } from "@/services/staff.service";
import { CreateStaffPayload } from "../../types/staff/createStaff.type";
import { StaffRole } from "@/types/auth.types";
import { useAuthStore } from "@/store/auth.store";
import {
  StaffValidationErrors,
  validateStaff,
} from "@/validators/staff.validator";

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
  const [errors, setErrors] = useState<StaffValidationErrors>({});

  function updateField<K extends keyof CreateStaffPayload>(
    field: K,
    value: CreateStaffPayload[K],
  ) {
    const updatedForm = {
      ...form,
      [field]: value,
    };

    setForm(updatedForm);
    setError(null);
    setErrors(validateStaff(updatedForm));
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      setError(null);

      const payload: CreateStaffPayload = {
        ...form,
        societyId: selectedSocietyId ?? undefined,
      };
      const validation = validateStaff(payload);

      if (Object.keys(validation).length > 0) {
        setErrors(validation);
        return;
      }
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
    loading,
    error,
    errors,
    updateField,
    handleSubmit,
  };
}
