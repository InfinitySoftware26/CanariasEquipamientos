"use client";

import { useState } from "react";
import { BadgeCheck, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { Staff } from "@/types/staff/staff.type";
import { deactivateStaff } from "@/services/staff.service";
import { useAuthStore } from "@/store/auth.store";
import {
  canDeactivateStaff,
  canEditStaff,
} from "@/permissions/staff.permissions";

import { StaffActions } from "./StaffActions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface StaffCardProps {
  staff: Staff;
  onRefresh: () => Promise<void>;
}

export function StaffCard({ staff, onRefresh }: StaffCardProps) {
  const router = useRouter();

  const activeRole = useAuthStore((state) => state.activeRole);

  const canEdit = canEditStaff(activeRole, staff.role);
  const canDeactivate = canDeactivateStaff(activeRole, staff.role);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleEdit() {
    router.push(`/staff/${staff.id}/edit`);
  }

  async function handleDeactivate() {
    try {
      setLoading(true);

      await deactivateStaff(staff.id);

      setOpenConfirm(false);

      await onRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <article
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          p-5
          transition-all
          duration-200
          hover:border-[#F5A300]/30
        "
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{staff.name}</h3>

            <p className="mt-1 text-sm text-white/60">DNI {staff.dni}</p>

            <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
              <Mail size={15} />
              <span>{staff.email}</span>
            </div>
          </div>

          <span className="rounded-full bg-[#F5A300]/20 px-3 py-1 text-xs font-semibold uppercase text-[#F5A300]">
            {staff.role}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-green-400">
            <BadgeCheck size={16} />
            Activo
          </div>

          {(canEdit || canDeactivate) && (
            <StaffActions
              isActive={staff.isActive && canDeactivate}
              onEdit={handleEdit}
              onDeactivate={() => setOpenConfirm(true)}
              loading={loading}
            />
          )}
        </div>
      </article>

      <ConfirmDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title="Desactivar empleado"
        description={`¿Está seguro que desea desactivar a "${staff.name}"?`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        loading={loading}
        destructive
        onConfirm={handleDeactivate}
      />
    </>
  );
}
