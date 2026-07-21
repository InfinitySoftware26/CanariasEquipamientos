"use client";

import { Button } from "@/components/ui/button";
import { Pencil, UserX } from "lucide-react";

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
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={onEdit}>
        <Pencil className="mr-1 h-4 w-4" />
        Editar
      </Button>

      {isActive && (
        <Button
          size="sm"
          variant="destructive"
          onClick={onDeactivate}
          disabled={loading}
        >
          <UserX className="mr-1 h-4 w-4" />
          {loading ? "Desactivando..." : "Desactivar"}
        </Button>
      )}
    </div>
  );
}
