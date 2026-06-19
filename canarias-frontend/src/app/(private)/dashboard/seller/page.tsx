"use client";

import { DollarSign, Search, ClipboardCheck } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { useAuthStore } from "@/store/auth.store";
import { useSellerDashboard } from "@/hooks/useDashboardKpis";
import { useRouter } from "next/dist/client/components/navigation";

export default function SellerDashboard() {
  const user = useAuthStore((state) => state.user);
  const { data } = useSellerDashboard();
  const router = useRouter();
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard title="Mis ventas" value={data.totalSales} />

          <KpiCard
            title="Pendientes validación"
            value={data.pendingAdminValidation}
          />

          <KpiCard
            title="Pendientes visita"
            value={data.pendingEnvironmentalVisit}
          />

          <KpiCard title="Pendientes entrega" value={data.pendingDelivery} />

          <KpiCard title="Ventas cerradas" value={data.closedSales} />
        </div>
      </section>
      {/* ACCIONES */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">
          Acciones rápidas
        </h2>

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
          />

          <DashboardCard
            title="Seguimiento comercial"
            description="Revisión de estado de ventas"
            icon={<ClipboardCheck size={22} />}
          />
        </div>
      </section>
    </div>
  );
}
