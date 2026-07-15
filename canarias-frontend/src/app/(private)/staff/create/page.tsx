"use client";

import { StaffForm } from "@/components/staff/StaffForm";
import { useCreateStaff } from "@/hooks/staff/useCreateStaff";

export default function CreateStaffPage() {
  const { form, setForm, loading, error, handleSubmit } = useCreateStaff();

  return (
    <div className="container-page py-8">
      <div className="mx-auto max-w-2xl">
        <StaffForm
          form={form}
          setForm={setForm}
          loading={loading}
          error={error}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
