"use client";

import { useState } from "react";
import { useAssignStaff } from "@/hooks/zones/useAssignStaff";
import { useCollectors } from "@/hooks/collector/useCollectors";

interface Props {
  zoneId: string;

  open: boolean;

  onClose(): void;

  onAssigned(): void;
}

export function AssignStaffModal({ zoneId, open, onClose, onAssigned }: Props) {
  const { collectors, loading } = useCollectors();
  const { assign, loading: saving, error } = useAssignStaff();
  const [staffId, setStaffId] = useState("");

  if (!open) {
    return null;
  }

  async function handleAssign() {
    if (!staffId) return;

    const success = await assign(zoneId, staffId);

    if (success) {
      onAssigned();

      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">Asignar cobrador</h2>

        <select
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          className="mt-6 w-full rounded-xl border border-white/10 bg-zinc-800 p-3"
        >
          <option value="">Seleccione un cobrador</option>

          {collectors.map((collector) => (
            <option key={collector.staffId} value={collector.staffId}>
              {collector.name}
            </option>
          ))}
        </select>

        {error && <p className="mt-4 text-red-400">{error}</p>}

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/20 px-4 py-2"
          >
            Cancelar
          </button>

          <button
            disabled={loading || saving}
            onClick={handleAssign}
            className="rounded-xl bg-cyan-600 px-4 py-2"
          >
            Asignar
          </button>
        </div>
      </div>
    </div>
  );
}
