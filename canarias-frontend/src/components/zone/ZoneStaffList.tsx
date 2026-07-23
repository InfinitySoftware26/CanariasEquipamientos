"use client";

import { useState } from "react";

import { ZoneStaff } from "@/types/zones/staff-zone.type";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Props {
  staff: ZoneStaff[];

  onRemove(id: string): Promise<void> | void;
}

export function ZoneStaffList({ staff, onRemove }: Props) {
  const [selectedStaff, setSelectedStaff] = useState<ZoneStaff | null>(null);

  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (!selectedStaff) return;

    try {
      setLoading(true);

      await onRemove(selectedStaff.staffId);

      setSelectedStaff(null);
    } finally {
      setLoading(false);
    }
  }

  if (!staff.length) {
    return <p className="text-white/60">No hay personal asignado.</p>;
  }

  return (
    <>
      <div className="space-y-4">
        {staff.map((employee) => (
          <article
            key={employee.staffId}
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-4
            "
          >
            <div>
              <h3 className="font-semibold">{employee.name}</h3>

              <p className="text-sm text-white/60">{employee.role}</p>

              <p className="text-xs text-white/40">{employee.email}</p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStaff(employee)}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-red-500/40
                px-4
                py-2
                text-red-400
                transition
                hover:bg-red-500/10
              "
            >
              Quitar
            </button>
          </article>
        ))}
      </div>

      <ConfirmDialog
        open={selectedStaff !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStaff(null);
          }
        }}
        title="Quitar empleado"
        description={
          selectedStaff
            ? `¿Está seguro que desea quitar a "${selectedStaff.name}" de esta zona?`
            : ""
        }
        confirmText="Quitar"
        cancelText="Cancelar"
        destructive
        loading={loading}
        onConfirm={handleRemove}
      />
    </>
  );
}
