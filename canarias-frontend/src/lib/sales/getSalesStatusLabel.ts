export function getSaleStatusLabel(status: string) {
  switch (status.toLowerCase()) {
    case "pending_admin_validation":
      return {
        label: "Pendiente de validación",
        className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      };

    case "pending_environmental_visit":
      return {
        label: "Pendiente de visita",
        className: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
      };

    case "pending_delivery":
      return {
        label: "Pendiente de entrega",
        className:
          "bg-violet-500/10 text-violet-400 border border-violet-500/20",
      };

    case "delivered":
      return {
        label: "Entregada",
        className: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
      };

    case "closed":
      return {
        label: "Cerrada",
        className:
          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      };

    case "rejected_admin":
      return {
        label: "Rechazada por administración",
        className: "bg-red-500/10 text-red-400 border border-red-500/20",
      };

    case "environmental_rejected":
      return {
        label: "Rechazada en visita",
        className: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      };

    default:
      return {
        label: "En proceso",
        className: "bg-slate-500/10 text-slate-300 border border-slate-500/20",
      };
  }
}
