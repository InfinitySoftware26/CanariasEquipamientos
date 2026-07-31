"use client";

import { Pencil, UserX } from "lucide-react";
import { DangerButton } from "@/components/button/DangerButton";
import { EditButton } from "@/components/button/EditButton";

interface StaffActionsProps {
  isActive: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  loading?: boolean;
}

export function StaffActions({
  isActive,
  onEdit,
  onDeactivate,
  loading = false,
}: StaffActionsProps) {
  return (
    <div className="flex gap-3">
      <EditButton type="button" onClick={onEdit}>
        <Pencil size={16} />
        Editar
      </EditButton>

      {isActive && (
        <DangerButton type="button" onClick={onDeactivate} disabled={loading}>
          <UserX size={16} />
          {loading ? "Desactivando..." : "Desactivar"}
        </DangerButton>
      )}
    </div>
  );
}
