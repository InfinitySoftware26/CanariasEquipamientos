"use client";

import { ZoneStatus } from "@/types/zones/zone.type";

interface Props {
  status: ZoneStatus | string;
}

export function ZoneStatusBadge({ status }: Props) {
  const normalized = status?.toLowerCase();

  const active =
    normalized === "active" ||
    normalized === "enabled" ||
    normalized === "activated";

  return (
    <span
      className={`
        rounded-full 
        px-3 
        py-1 
        text-xs 
        font-semibold
        ${
          active
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-red-500/20 text-red-400"
        }
      `}
    >
      {active ? "Activa" : "Inactiva"}
    </span>
  );
}
