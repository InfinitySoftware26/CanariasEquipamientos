"use client";

import { User } from "lucide-react";
import { useStaff } from "@/hooks/staff/useStaff";
import { StaffCard } from "./StaffCard";
import { StaffFilter } from "./StaffFilter";

export function StaffList() {
  const { staff, loading, error, search, setSearch, refreshStaff } = useStaff();

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
        <p className="text-white/60">Cargando empleados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
        <User size={42} className="mx-auto mb-4 text-white/40" />

        <h3 className="text-xl font-semibold text-white">
          No hay empleados registrados
        </h3>

        <p className="mt-2 text-white/60">
          Cuando agregues un empleado aparecerá en esta lista.
        </p>
      </div>
    );
    {
      console.log(staff);
    }
  }

  return (
    <>
      <StaffFilter value={search} onChange={setSearch} />

      <div className="space-y-4">
        {staff.map((employee) => (
          <StaffCard
            key={employee.id}
            staff={employee}
            onRefresh={refreshStaff}
          />
        ))}
      </div>
    </>
  );
}
