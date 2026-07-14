"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCreateZone } from "@/hooks/zones/useCreateZone";
import { ZoneForm } from "@/components/zone/ZoneForm";

export default function NewZonePage() {
  const router = useRouter();

  const { create, loading, error } = useCreateZone();

  async function handleSubmit(data: { name: string; description: string }) {
    const zone = await create(data);

    if (!zone) {
      return;
    }

    router.push(`/zones/${zone.zoneId}`);
  }

  return (
    <section className="space-y-8">
      <Link
        href="/zones"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white"
      >
        <ArrowLeft size={18} />
        Volver
      </Link>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold">Nueva Zona</h1>

        <p className="mt-2 text-white/60">
          Creá una nueva zona para organizar vendedores y cobradores.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        <ZoneForm loading={loading} onSubmit={handleSubmit} />
      </div>
    </section>
  );
}
