"use client";

import Link from "next/link";

import { Zone } from "@/types/zones/zone.type";
import { ZoneStatusBadge } from "./ZoneStatusBadge";

interface Props {
  zone: Zone;
}

export function ZoneCard({ zone }: Props) {
  return (
    <Link href={`/zones/${zone.zoneId}`}>
      <article
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-6
          transition
          hover:bg-white/10
        "
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">{zone.name}</h2>

            <p className="mt-2 text-sm text-white/60">
              {zone.description || "Sin descripción"}
            </p>
          </div>

          <ZoneStatusBadge status={zone.status} />
        </div>

        <div className="mt-6 flex justify-end">
          <span className="text-sm text-cyan-400">Ver detalle →</span>
        </div>
      </article>
    </Link>
  );
}
