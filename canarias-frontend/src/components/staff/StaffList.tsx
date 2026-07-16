"use client";

import { BadgeCheck, Mail, User } from "lucide-react";

import { Staff } from "@/types/staff/staff.type";

interface Props {
  staff: Staff[];
}

export function StaffList({ staff }: Props) {
  if (staff.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
        <User
          size={42}
          className="mx-auto mb-4 text-white/40"
        />

        <h3 className="text-xl font-semibold text-white">
          No hay empleados registrados
        </h3>

        <p className="mt-2 text-white/60">
          Cuando agregues un empleado aparecerá en esta lista.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {staff.map((employee) => (
        <div
          key={employee.id}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-[#F5A300]/30"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {employee.name}
              </h3>

              <p className="mt-1 text-sm text-white/60">
                DNI {employee.dni}
              </p>

              <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
                <Mail size={15} />

                {employee.email}
              </div>
            </div>

            <span className="rounded-full bg-[#F5A300]/20 px-3 py-1 text-xs font-semibold uppercase text-[#F5A300]">
              {employee.role}
            </span>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-green-400">
            <BadgeCheck size={16} />

            Activo
          </div>
        </div>
      ))}
    </div>
  );
}