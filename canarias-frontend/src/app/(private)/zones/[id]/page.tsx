"use client";

import { useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2, Users } from "lucide-react";
import { AddButton } from "@/components/button/AddButton";
import { DangerButton } from "@/components/button/DangerButton";
import { EditButton } from "@/components/button/EditButton";

import { useZone } from "@/hooks/zones/useZone";
import { useZoneStaff } from "@/hooks/zones/useZoneStaff";
import { useDeleteZone } from "@/hooks/zones/useDeleteZone";

import { ZoneStatusBadge } from "@/components/zone/ZoneStatusBadge";
import { ZoneStaffList } from "@/components/zone/ZoneStaffList";
import { AssignStaffModal } from "@/components/staff/AssignStaffModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ZoneDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [openAssign, setOpenAssign] = useState(false);

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openDeleteSuccess, setOpenDeleteSuccess] = useState(false);

  const id = params?.id;

  const zoneId = typeof id === "string" ? id : undefined;

  const { zone, loading, error } = useZone(zoneId);

  const {
    staff,
    loading: loadingStaff,
    remove: removeStaff,
    reload,
  } = useZoneStaff(zoneId);

  const {
    remove: deleteZone,
    loading: deleting,
    error: deleteError,
  } = useDeleteZone();

  async function handleDelete() {
    if (!zoneId) return;

    const success = await deleteZone(zoneId);

    if (success) {
      setOpenDeleteConfirm(false);
      setOpenDeleteSuccess(true);
    }
  }

  if (!zoneId) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <h2 className="text-xl font-semibold">Zona inválida</h2>

        <p className="mt-2 text-white/60">
          No se encontró el identificador de la zona.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        Cargando zona...
      </div>
    );
  }

  if (error || !zone) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center text-red-300">
        {error ?? "No fue posible cargar la zona"}
      </div>
    );
  }

  return (
    <>
      <section className="space-y-8">
        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-8
          "
        >
          <div
            className="
              flex
              flex-col
              gap-6
              lg:flex-row
              lg:items-start
              lg:justify-between
            "
          >
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{zone.name}</h1>

                <ZoneStatusBadge status={zone.status} />
              </div>

              <p className="mt-4 max-w-3xl text-white/60">
                {zone.description || "Sin descripción"}
              </p>
            </div>

            <div className="flex gap-3">
              <EditButton asChild className="inline-flex gap-2 px-4">
                <Link href={`/zones/${zone.zoneId}/edit`}>
                  <Pencil size={16} />
                  Editar
                </Link>
              </EditButton>

              <DangerButton
                onClick={() => setOpenDeleteConfirm(true)}
                disabled={deleting}
                className="inline-flex gap-2 px-4"
              >
                <Trash2 size={16} />

                {deleting ? "Desactivando..." : "Desactivar"}
              </DangerButton>
            </div>
          </div>
        </div>

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-8
          "
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users />

              <h2 className="text-xl font-semibold">Personal asignado</h2>
            </div>

            <AddButton
              onClick={() => setOpenAssign(true)}
              className="rounded-2xl px-5 py-3 font-semibold text-[#0F172A] hover:bg-[#E09400] hover:shadow-lg hover:shadow-[#F5A300]/20"
            >
              Asignar personal
            </AddButton>
          </div>

          {loadingStaff ? (
            <div className="py-6 text-center text-white/60">
              Cargando personal...
            </div>
          ) : (
            <ZoneStaffList staff={staff} onRemove={removeStaff} />
          )}
        </div>
        {deleteError && (
          <div
            className="
              rounded-xl
              bg-red-500/10
              p-4
              text-red-400
            "
          >
            {deleteError}
          </div>
        )}
      </section>

      <AssignStaffModal
        open={openAssign}
        zoneId={zoneId}
        onClose={() => setOpenAssign(false)}
        onAssigned={reload}
      />

      <ConfirmDialog
        open={openDeleteConfirm}
        onOpenChange={setOpenDeleteConfirm}
        title="Desactivar zona"
        description={`¿Está seguro que desea desactivar la zona "${zone.name}"?`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        loading={deleting}
        destructive
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={openDeleteSuccess}
        onOpenChange={setOpenDeleteSuccess}
        title="Zona desactivada"
        description="La zona fue desactivada correctamente."
        confirmText="Aceptar"
        onConfirm={() => router.push("/zones")}
      />
    </>
  );
}
