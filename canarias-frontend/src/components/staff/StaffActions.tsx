"use client";

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
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onEdit}
        className="
          inline-flex
          items-center
          gap-2
          rounded-xl
          border
          border-[#F5A300]/40
          px-4
          py-2
          text-[#F5A300]
          transition
          hover:bg-[#F5A300]/10
        "
      >
        <Pencil size={16} />
        Editar
      </button>

      {isActive && (
        <button
          type="button"
          onClick={onDeactivate}
          disabled={loading}
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
            disabled:opacity-50
          "
        >
          <UserX size={16} />
          {loading ? "Desactivando..." : "Desactivar"}
        </button>
      )}
    </div>
  );
}