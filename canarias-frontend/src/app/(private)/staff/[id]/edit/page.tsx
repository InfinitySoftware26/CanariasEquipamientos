"use client";

import { use } from "react";

import { StaffForm } from "@/components/staff/StaffForm";
import { useUpdateStaff } from "@/hooks/staff/useUpdateStaff";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function EditStaffPage({ params }: Props) {
  const { id } = use(params);

  const { form, loading, saving, error, errors, updateField, handleSubmit} =
    useUpdateStaff(id);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-10">
        <p className="text-center text-white/60">Cargando empleado...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <StaffForm
        title="Editar empleado"
        submitLabel="Guardar cambios"
        form={form}
        loading={saving}
        error={error}
        errors={errors}
        updateField={updateField}
        handleSubmit={handleSubmit}
        mode="edit"
      />
    </div>
  );
}
