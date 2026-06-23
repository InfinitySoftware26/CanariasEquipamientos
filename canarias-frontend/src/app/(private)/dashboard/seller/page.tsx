"use client";

import { DollarSign, Search } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { useAuthStore } from "@/store/auth.store";
import { useSellerDashboard } from "@/hooks/seller/useSellerDashboard";
import { useRouter } from "next/navigation";

export default function SellerDashboard() {
  const user = useAuthStore((state) => state.user);
  const { pipeline, alerts } = useSellerDashboard();
  const router = useRouter();

  return (
    <div className="space-y-10">
      {/* HEADER / HERO */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#10254A] via-[#16315F] to-[#21457A] p-8">
        <h1 className="text-3xl font-bold text-white">
          Bienvenido{" "}
          <span className="text-[#F5A300]">{user?.name ?? "Usuario"}</span> 👋
        </h1>

        <p className="mt-3 text-white/70">
          Estado en tiempo real de tu flujo comercial.
        </p>
      </section>

      {/* PIPELINE KPI SECTION (NUEVO FOCO) */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Pipeline de ventas</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard title="Validación admin" value={pipeline.adminValidation} />

          <KpiCard title="Visita ambiental" value={pipeline.envVisit} />

          <KpiCard title="Pendiente entrega" value={pipeline.delivery} />

          <KpiCard title="Cerradas" value={pipeline.closed} />

          <KpiCard title="Rechazadas" value={pipeline.rejected} />
        </div>
      </section>

      {/* ALERTAS (DIFERENCIAL DEL DASHBOARD) */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">
          Alertas del sistema
        </h2>

        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-white/50">Sin alertas en tu flujo de ventas.</p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div
              key={i}
              className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4"
            >
              <p className="text-amber-300 text-sm">⚠ {alert}</p>
            </div>
          ))
        )}
      </section>

      {/* ACCIONES (SE MANTIENE TU IDENTIDAD) */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Acciones rápidas</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardCard
            title="Nueva Venta"
            description="Precarga de venta"
            icon={<DollarSign size={22} />}
            onClick={() => router.push("/sales/preload")}
          />

          <DashboardCard
            title="Mis Clientes"
            description="Gestión de clientes"
            icon={<Search size={22} />}
            onClick={() => router.push("/clients")}
          />
        </div>
      </section>
    </div>
  );
}
