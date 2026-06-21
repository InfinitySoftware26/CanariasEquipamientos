export function getSaleStatusLabel(status: string) {
  const s = status.toLowerCase();

  if (s.includes("pending")) {
    return {
      label: "Pendiente",
      className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    };
  }

  if (s.includes("closed") || s.includes("delivered")) {
    return {
      label: "Cerrada",
      className:
        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    };
  }

  return {
    label: "En proceso",
    className: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
  };
}
