"use client";

import { ZoneStaff } from "@/types/zones/staff-zone.type";

interface Props {
  staff: ZoneStaff[];

  onRemove(id: string): void;
}

export function ZoneStaffList({ staff, onRemove }: Props) {
  if (!staff.length) {
    return <p className="text-white/60">No hay personal asignado.</p>;
  }

  return (
    <div className="space-y-4">
      {staff.map((employee) => (
        <article
          key={employee.staffId}
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-4
            flex
            items-center
            justify-between
          "
        >
          <div>
            <h3 className="font-semibold">{employee.name}</h3>

            <p className="text-sm text-white/60">{employee.role}</p>

            <p className="text-xs text-white/40">{employee.email}</p>
          </div>

          <button
            onClick={() => onRemove(employee.staffId)}
            className="text-red-400 hover:text-red-300"
          >
            Quitar
          </button>
        </article>
      ))}
    </div>
  );
}
