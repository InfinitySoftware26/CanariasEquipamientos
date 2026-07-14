"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { useZone } from "@/hooks/zones/useZone";
import { useUpdateZone } from "@/hooks/zones/useUpdateZone";
import { ZoneForm } from "@/components/zone/ZoneForm";

export default function EditZonePage() {
  const params = useParams();

  const router = useRouter();

  const id = params?.id;

  const zoneId = typeof id === "string" ? id : undefined;

  const { zone, loading, error } = useZone(zoneId);

  const { update, loading: saving } = useUpdateZone();

  async function handleSubmit(data: { name: string; description: string }) {
    if (!zoneId) return;

    const updated = await update(zoneId, data);

    if (updated) {
      router.push(`/zones/${zoneId}`);
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
    <section className="space-y-8">
      <Link
        href={`/zones/${zoneId}`}
        className="
          inline-flex
          items-center
          gap-2
          text-white/60
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
  );
}
