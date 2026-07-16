"use client";

import { StaffForm } from "@/components/staff/StaffForm";
import { useCreateStaff } from "@/hooks/staff/useCreateStaff";

export default function CreateStaffPage() {
  const {
    form,
    loading,
    error,
    errors,
    handleSubmit,
    updateField,
  } = useCreateStaff();

  return (
    <div className="container-page py-8">
      <div className="mx-auto max-w-2xl">
        <StaffForm
          form={form}
          updateField={updateField}
          loading={loading}
          error={error}
          errors={errors}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
