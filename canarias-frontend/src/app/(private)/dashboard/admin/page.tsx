"use client";

import {
  ClipboardCheck,
  Truck,
  CheckCircle2,
  XCircle,
  DollarSign,
  BarChart3,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";

import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PipelineCard } from "@/components/dashboard/PipelineCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { AlertsSection } from "@/components/admin/AlertsSection";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { RecentSalesTable } from "@/components/admin/RecentSalesTable";

export default function AdminDashboard() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);

  const { loading, metrics, pipeline, activities, recentSales } =
    useAdminDashboard();

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-52 rounded-3xl bg-white/5" />

        <div className="grid gap-5 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHero
        badge="Consola Administrativa"
        title={`Bienvenido ${user?.name}`}
        subtitle="Control operativo de validaciones, visitas, entregas y cierre de ventas."
        action={
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
            <p className="text-xs uppercase tracking-widest text-white/50">
              Ventas Totales
            </p>

            <h2 className="mt-2 text-5xl font-bold text-white">
              {metrics.totalSales}
            </h2>
          </div>
        }
      />

      {/* KPIs */}

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">Indicadores</h2>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
          <KpiCard
            title="Pendientes"
            value={metrics.pendingSales}
            icon={<ClipboardCheck />}
          />

          <KpiCard
            title="Entregadas"
            value={metrics.deliveredSales}
            icon={<Truck />}
          />

          <KpiCard
            title="Cerradas"
            value={metrics.closedSales}
            icon={<BarChart3 />}
            trend="up"
          />

          <KpiCard
            title="Rechazadas"
            value={metrics.rejectedSales}
            icon={<XCircle />}
            trend="down"
          />

          <KpiCard
            title="Ticket Promedio"
            value={`$${metrics.averageTicket.toLocaleString("es-AR")}`}
            icon={<DollarSign />}
          />

          <KpiCard
            title="Monto Total"
            value={`$${metrics.totalAmount.toLocaleString("es-AR")}`}
            icon={<DollarSign />}
          />
        </div>
      </section>

      {/* Pipeline */}

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">
          Pipeline Comercial
        </h2>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <PipelineCard
            title="Pend. Validación"
            value={pipeline.adminValidation}
          />

          <PipelineCard title="Pend. Visita" value={pipeline.envVisit} />

          <PipelineCard title="Pend. Entrega" value={pipeline.delivery} />

          <PipelineCard title="Cerradas" value={pipeline.closed} highlight />

          <PipelineCard title="Rechazadas" value={pipeline.rejected} />
        </div>
      </section>

      <AlertsSection pipeline={pipeline} />

      <div className="grid gap-8 xl:grid-cols-2">
        <RecentActivity activities={activities} />

        <RecentSalesTable sales={recentSales} />
      </div>

      <section>
        <h2 className="mb-5 text-xl font-semibold text-white">
          Acciones rápidas
        </h2>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard
            title="Validar ventas"
            description="Ventas esperando aprobación"
            icon={<ClipboardCheck size={22} />}
            onClick={() =>
              router.push("/sales?status=PENDING_ADMIN_VALIDATION")
            }
          />

          <QuickActionCard
            title="Coordinar visitas"
            description="Visitas ambientales"
            icon={<Truck size={22} />}
            onClick={() =>
              router.push("/sales?status=PENDING_ENVIRONMENTAL_VISIT")
            }
          />

          <QuickActionCard
            title="Entregas"
            description="Ventas listas para entregar"
            icon={<CheckCircle2 size={22} />}
            onClick={() => router.push("/sales?status=PENDING_DELIVERY")}
          />

          <QuickActionCard
            title="Rechazadas"
            description="Revisar operaciones"
            icon={<XCircle size={22} />}
            onClick={() => router.push("/sales?status=REJECTED_ADMIN")}
          />
        </div>
      </section>
    </div>
  );
}
