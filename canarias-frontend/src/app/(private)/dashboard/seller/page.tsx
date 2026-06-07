"use client";

import { UserPlus, DollarSign, Search, ClipboardCheck } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { useAuthStore } from "@/store/auth.store";
import { useSellerKpis } from "@/hooks/useSellerKpis";

export default function SellerDashboard() {
  const user = useAuthStore((state) => state.user);
  const { data } = useSellerKpis();

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section
        className="
        rounded-3xl border border-white/10
        bg-gradient-to-r from-[#10254A] via-[#16315F] to-[#21457A]
        p-8
      "
      >
        <h1 className="text-3xl font-bold text-white">
          Bienvenido{" "}
          <span className="text-[#F5A300]">{user?.name ?? "Usuario"}</span> 👋
        </h1>

        <p className="mt-3 text-white/70">Seguimiento comercial diario.</p>
      </section>

      {/* KPI */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">Resumen</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard title="Ventas del día" value={data?.salesToday ?? 0} />

          <KpiCard
            title="Comisión diaria"
            value={`$${data?.dailyCommission ?? 0}`}
          />

          <KpiCard
            title="Comisión mensual"
            value={`$${data?.monthlyCommission ?? 0}`}
          />

          <KpiCard
            title="Clientes pendientes"
            value={data?.pendingClients ?? 0}
          />

          <KpiCard title="Ventas aprobadas" value={data?.approvedSales ?? 0} />
        </div>
      </section>

      {/* ACCIONES */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">
          Acciones rápidas
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardCard
            title="Crear cliente"
            description="Precarga de cliente"
            icon={<UserPlus size={22} />}
          />

          <DashboardCard
            title="Crear venta"
            description="Registrar operación"
            icon={<DollarSign size={22} />}
          />

          <DashboardCard
            title="Consultar clientes"
            description="Buscar información"
            icon={<Search size={22} />}
          />

          <DashboardCard
            title="Verificaciones"
            description="Pendientes"
            icon={<ClipboardCheck size={22} />}
          />
        </div>
      </section>
    </div>
  );
}
