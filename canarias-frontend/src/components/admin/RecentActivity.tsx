"use client";

import { ClipboardCheck, Truck, CheckCircle2, XCircle } from "lucide-react";

import { DashboardActivity } from "@/hooks/admin/useAdminDashboard";

interface RecentActivityProps {
  activities: DashboardActivity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: DashboardActivity["type"]) => {
    switch (type) {
      case "validation":
        return <ClipboardCheck size={18} />;

      case "visit":
        return <Truck size={18} />;

      case "delivery":
        return <Truck size={18} />;

      case "closed":
        return <CheckCircle2 size={18} />;

      case "rejected":
        return <XCircle size={18} />;

      default:
        return <ClipboardCheck size={18} />;
    }
  };

  const getColor = (type: DashboardActivity["type"]) => {
    switch (type) {
      case "validation":
        return "bg-amber-500/20 text-amber-400";

      case "visit":
        return "bg-blue-500/20 text-blue-400";

      case "delivery":
        return "bg-cyan-500/20 text-cyan-400";

      case "closed":
        return "bg-green-500/20 text-green-400";

      case "rejected":
        return "bg-red-500/20 text-red-400";

      default:
        return "bg-white/10";
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-6 text-lg font-semibold text-white">
        Actividad reciente
      </h2>

      <div className="space-y-5">
        {activities.length === 0 && (
          <p className="text-sm text-white/50">No hay actividad reciente.</p>
        )}

        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${getColor(
                activity.type,
              )}`}
            >
              {getIcon(activity.type)}
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-white">{activity.title}</h3>

              <p className="text-sm text-white/60">{activity.description}</p>

              <p className="mt-1 text-xs text-white/40">
                {new Date(activity.date).toLocaleDateString("es-AR")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
