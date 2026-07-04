"use client";

import { Truck, CheckCircle2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { KpiCard } from "@/components/dashboard/KpiCard";

import { useAuthStore } from "@/store/auth.store";
import { useCollectorDashboard } from "@/hooks/collector/useCollectorDashboard";
import { useCollectorSales } from "@/hooks/collector/useCollectorSale";

export default function CollectorDashboard() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  // 🔥 fuente única de datos
  const { sales } = useCollectorSales();

  // 🔥 ahora SÍ pasamos sales al hook
  const { stats, alerts } = useCollectorDashboard(sales);
  console.log(
    "STATUSES:",
    sales.map((s) => s.status),
  );
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#10254A] via-[#16315F] to-[#21457A] p-8">
        <h1 className="text-3xl font-bold text-white">
          Bienvenido{" "}
          <span className="text-[#F5A300]">{user?.name ?? "Cobrador"}</span> 👋
        </h1>

        <p className="mt-3 text-white/70">
          Gestión de visitas, cobros y seguimiento de operaciones.
        </p>
      </section>

      {/* KPIs */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Estado de tus asignaciones
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Pend. Visita" value={stats.pendingVisit} />
          <KpiCard title="Pend. Entrega" value={stats.pendingDelivery} />
          <KpiCard title="Rechazadas" value={stats.rejected} />
        </div>
      </section>

      {/* ALERTAS */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Alertas operativas</h2>

        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-white/50">No existen alertas pendientes.</p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div
              key={i}
              className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4"
            >
              <p className="text-sm text-amber-300">⚠ {alert}</p>
            </div>
          ))
        )}
      </section>

      {/* ACCIONES */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Acciones rápidas</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Visitas pendientes"
            description="Ventas para visitar"
            icon={<Truck size={22} />}
            onClick={() =>
              router.push("/sales/collector?status=PENDING_ENVIRONMENTAL_VISIT")
            }
          />

          <DashboardCard
            title="Listas para entrega"
            description="Ventas cobradas"
            icon={<CheckCircle2 size={22} />}
            onClick={() =>
              router.push("/sales/collector?status=PENDING_DELIVERY")
            }
          />

          <DashboardCard
            title="Rechazadas"
            description="Visitas rechazadas"
            icon={<AlertTriangle size={22} />}
            onClick={() =>
              router.push("/sales/collector?status=ENVIRONMENTAL_REJECTED")
            }
          />
        </div>
      </section>
    </div>
  );
}
