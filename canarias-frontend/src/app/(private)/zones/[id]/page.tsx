"use client";

import { useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Users } from "lucide-react";

import { useZone } from "@/hooks/zones/useZone";
import { useZoneStaff } from "@/hooks/zones/useZoneStaff";
import { useDeleteZone } from "@/hooks/zones/useDeleteZone";

import { ZoneStatusBadge } from "@/components/zone/ZoneStatusBadge";
import { ZoneStaffList } from "@/components/zone/ZoneStaffList";
import { AssignStaffModal } from "@/components/staff/AssignStaffModal";

export default function ZoneDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [openAssign, setOpenAssign] = useState(false);

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

    const confirmed = window.confirm("¿Desea desactivar esta zona?");

    if (!confirmed) return;

    const success = await deleteZone(zoneId);

    if (success) {
      router.push("/zones");
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
        <Link
          href="/zones"
          className="
            inline-flex
            items-center
            gap-2
            text-white/60
            transition
            hover:text-white
          "
        >
          <ArrowLeft size={18} />
          Volver
        </Link>

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
              <Link
                href={`/zones/${zone.zoneId}/edit`}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-cyan-500/40
                  px-4
                  py-2
                  text-cyan-400
                  hover:bg-cyan-500/10
                "
              >
                <Pencil size={16} />
                Editar
              </Link>

              <button
                onClick={handleDelete}
                disabled={deleting}
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
                  hover:bg-red-500/10
                  disabled:opacity-50
                "
              >
                <Trash2 size={16} />

                {deleting ? "Desactivando..." : "Desactivar"}
              </button>
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

            <button
              onClick={() => setOpenAssign(true)}
              className="
                rounded-xl
                bg-cyan-600
                px-4
                py-2
                transition
                hover:bg-cyan-500
              "
            >
              Asignar personal
            </button>
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
    </>
  );
}
