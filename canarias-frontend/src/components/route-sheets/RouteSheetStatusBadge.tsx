import { RouteSheetStatus } from "@/types/rotue-sheets/routeSheets.types";

interface Props {
  status: RouteSheetStatus | string;
}

const config = {
  PENDING: {
    label: "Pendiente",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  },

  IN_PROGRESS: {
    label: "En progreso",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },

  COMPLETED: {
    label: "Completada",
    className: "bg-green-500/10 text-green-400 border-green-500/30",
  },

  CANCELLED: {
    label: "Cancelada",
    className: "bg-red-500/10 text-red-400 border-red-500/30",
  },
} as const;

export function RouteSheetStatusBadge({ status }: Props) {
  const normalized = status?.toUpperCase();

  const item = config[normalized as keyof typeof config] ?? {
    label: status,
    className: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  };

  return (
    <span
      className={`
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        ${item.className}
      `}
    >
      {item.label}
    </span>
  );
}
