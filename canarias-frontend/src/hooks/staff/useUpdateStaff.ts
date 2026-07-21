"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getStaffById,
  updateStaff,
} from "@/services/staff.service";

import { StaffRole } from "@/types/auth.types";

import { validateUpdateStaff } from "@/validators/updateStaff.validator";
import { StaffValidationErrors } from "@/validators/staff.validator";

interface UpdateStaffForm {
  name: string;
  dni: string;
  email: string;
  role: StaffRole;
  phone: string;
}

export function useUpdateStaff(id: string) {
  const router = useRouter();

  const [form, setForm] = useState<UpdateStaffForm>({
    name: "",
    dni: "",
    email: "",
    role: StaffRole.SELLER,
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [errors, setErrors] = useState<StaffValidationErrors>({});

  useEffect(() => {
    async function loadStaff() {
      try {
        const employee = await getStaffById(id);

        setForm({
          name: employee.name,
          dni: employee.dni,
          email: employee.email,
          role: employee.role,
          phone: employee.phone ?? "",
        });
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el empleado");
      } finally {
        setLoading(false);
      }
    }

    loadStaff();
  }, [id]);

  function updateField<K extends keyof UpdateStaffForm>(
    field: K,
    value: UpdateStaffForm[K],
  ) {
    const updated = {
      ...form,
      [field]: value,
    };

    setForm(updated);

    setErrors(validateUpdateStaff(updated));
  }

  async function handleSubmit() {
    const validation = validateUpdateStaff(form);

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
      };

      await updateStaff(id, payload);

      router.push("/staff");

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el empleado");
    } finally {
      setSaving(false);
    }
  }

  return {
    form,
    loading,
    saving,
    error,
    errors,
    updateField,
    handleSubmit,
  };
}
