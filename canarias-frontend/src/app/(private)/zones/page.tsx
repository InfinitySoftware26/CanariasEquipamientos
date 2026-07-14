"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { useZones } from "@/hooks/zones/useZones";
import { ZoneCard } from "@/components/zone/ZoneCard";

export default function ZonesPage() {
  const { zones, loading, error } = useZones();

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Zonas</h1>

          <p className="mt-2 text-sm text-white/60">
            Administración de zonas comerciales.
          </p>
        </div>

        <Link
          href="/zones/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 font-medium transition hover:bg-cyan-500"
        >
          <Plus size={18} />
          Nueva zona
        </Link>
      </div>

      {loading && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          Cargando zonas...
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
          {error}
        </div>
      )}

      {!loading && !zones.length && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
          <h2 className="text-xl font-semibold">No existen zonas</h2>

          <p className="mt-2 text-white/60">
            Creá la primera zona para comenzar.
          </p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
        {Array.isArray(zones) &&
          zones.map((zone) => <ZoneCard key={zone.zoneId} zone={zone} />)}
      </div>
    </section>
  );
}
