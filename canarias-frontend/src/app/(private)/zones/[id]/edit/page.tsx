"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useZone } from "@/hooks/zones/useZone";
import { useUpdateZone } from "@/hooks/zones/useUpdateZone";

import { ZoneForm } from "@/components/zone/ZoneForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function EditZonePage() {
  const params = useParams();

  const router = useRouter();

  const id = params?.id;

  const zoneId = typeof id === "string" ? id : undefined;

  const { zone, loading, error } = useZone(zoneId);

  const { update, loading: saving } = useUpdateZone();

  const [successOpen, setSuccessOpen] = useState(false);

  async function handleSubmit(data: { name: string; description: string }) {
    if (!zoneId) return;

    const updated = await update(zoneId, data);

    if (updated) {
      setSuccessOpen(true);
    }
  }

  if (!zoneId) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        Zona inválida
      </div>
    );
  }

  if (loading || !zone) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        Cargando...
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
          <h1 className="text-3xl font-bold">Editar Zona</h1>

          <p className="mt-2 text-white/60">
            Modificá la información de la zona.
          </p>
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
          <ZoneForm
            initialValues={zone}
            loading={saving}
            onSubmit={handleSubmit}
          />
        </div>

        {error && <div className="text-red-400">{error}</div>}
      </section>

      <ConfirmDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Zona actualizada"
        description="La zona fue actualizada correctamente."
        confirmText="Aceptar"
        onConfirm={() => router.push(`/zones/${zoneId}`)}
      />
    </>
  );
}
