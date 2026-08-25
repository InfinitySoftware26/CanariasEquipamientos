"use client";

import {
  ClipboardCheck,
  Truck,
  CheckCircle2,
  XCircle,
  DollarSign,
  Clock,
  Banknote,
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

  const { loading, error, metrics, pipeline, activities, recentSales } =
    useAdminDashboard();

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Hero */}
        <div className="h-44 rounded-3xl bg-white/5" />

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl bg-white/5" />
          ))}
        </div>

        {/* Attention */}
        <div className="h-56 rounded-2xl bg-white/5" />

        {/* Pipeline */}
        <div className="h-40 rounded-2xl bg-white/5" />

        {/* Actions */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 rounded-2xl bg-white/5" />
          ))}
        </div>

        {/* Activity */}
        <div className="h-80 rounded-2xl bg-white/5" />
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-400/20 bg-red-500/10 p-8 text-center">
          <XCircle size={42} className="mx-auto mb-4 text-red-400" />

          <h2 className="text-lg font-semibold text-white">
            No se pudo cargar el dashboard
          </h2>

          <p className="mt-2 text-sm text-white/60">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <DashboardHero
        badge="Consola Administrativa"
        title={`Bienvenido ${user?.name ?? "Administrador"}`}
        subtitle="Resumen operativo de ventas, cobranzas y operaciones pendientes."
        action={
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
            <p className="text-xs uppercase tracking-widest text-white/50">
              Ventas totales
            </p>

            <p className="mt-1 text-4xl font-bold text-white">
              {metrics.totalSales}
            </p>
          </div>
        }
      />

      {/* ====================================================== */}
      {/* 4 KPIs PRINCIPALES */}
      {/* ====================================================== */}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Resumen del día
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Ventas */}

          <KpiCard
            title="Ventas"
            value={metrics.totalSales}
            icon={<ClipboardCheck size={22} />}
          />

          {/* Pendientes */}

          <KpiCard
            title="Pendientes"
            value={metrics.pendingSales}
            icon={<Clock size={22} />}
          />

          {/* Entregas */}

          <KpiCard
            title="Entregas"
            value={metrics.deliveredSales}
            icon={<Truck size={22} />}
          />

          {/* Cobranza / monto */}

          <KpiCard
            title="Monto vendido"
            value={`$${metrics.totalAmount.toLocaleString("es-AR")}`}
            icon={<DollarSign size={22} />}
          />
        </div>
      </section>

      {/* ====================================================== */}
      {/* REQUIERE ATENCIÓN */}
      {/* ====================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Requiere atención
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Operaciones que requieren una acción administrativa.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Validaciones */}

          <button
            type="button"
            onClick={() =>
              router.push("/sales?status=PENDING_ADMIN_VALIDATION")
            }
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/50">Validaciones</p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {pipeline.adminValidation}
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <ClipboardCheck size={20} className="text-white/70" />
              </div>
            </div>

            <p className="mt-4 text-xs text-white/40 transition group-hover:text-white/60">
              Revisar ventas pendientes →
            </p>
          </button>

          {/* Visitas */}

          <button
            type="button"
            onClick={() =>
              router.push("/sales?status=PENDING_ENVIRONMENTAL_VISIT")
            }
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/50">Visitas</p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {pipeline.envVisit}
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <Truck size={20} className="text-white/70" />
              </div>
            </div>

            <p className="mt-4 text-xs text-white/40 transition group-hover:text-white/60">
              Coordinar visitas →
            </p>
          </button>

          {/* Entregas */}

          <button
            type="button"
            onClick={() => router.push("/sales?status=PENDING_DELIVERY")}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/50">Entregas</p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {pipeline.delivery}
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <CheckCircle2 size={20} className="text-white/70" />
              </div>
            </div>

            <p className="mt-4 text-xs text-white/40 transition group-hover:text-white/60">
              Ver entregas pendientes →
            </p>
          </button>

          {/* Cierres */}

          <button
            type="button"
            onClick={() => router.push("/closures")}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/50">Cierres</p>

                <p className="mt-2 text-3xl font-bold text-white">0</p>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <Banknote size={20} className="text-white/70" />
              </div>
            </div>

            <p className="mt-4 text-xs text-white/40 transition group-hover:text-white/60">
              Revisar cierres →
            </p>
          </button>
        </div>
      </section>

      {/* ====================================================== */}
      {/* PIPELINE */}
      {/* ====================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Estado de operaciones
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <PipelineCard title="Validación" value={pipeline.adminValidation} />

          <PipelineCard title="Visita" value={pipeline.envVisit} />

          <PipelineCard title="Entrega" value={pipeline.delivery} />

          <PipelineCard title="Cerradas" value={pipeline.closed} highlight />
        </div>
      </section>

      {/* ====================================================== */}
      {/* ALERTAS */}
      {/* ====================================================== */}

      <AlertsSection pipeline={pipeline} />

      {/* ====================================================== */}
      {/* ACCIONES RÁPIDAS */}
      {/* ====================================================== */}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Acciones rápidas
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard
            title="Validar ventas"
            description="Revisar aprobaciones pendientes"
            icon={<ClipboardCheck size={22} />}
            onClick={() =>
              router.push("/sales?status=PENDING_ADMIN_VALIDATION")
            }
          />

          <QuickActionCard
            title="Entregas"
            description="Gestionar entregas pendientes"
            icon={<Truck size={22} />}
            onClick={() => router.push("/sales?status=PENDING_DELIVERY")}
          />

          <QuickActionCard
            title="Cuotas vencidas"
            description="Consultar clientes morosos"
            icon={<Clock size={22} />}
            onClick={() => router.push("/installments?status=overdue")}
          />

          <QuickActionCard
            title="Cierres diarios"
            description="Revisar cierres de cobradores"
            icon={<Banknote size={22} />}
            onClick={() => router.push("/closures")}
          />
        </div>
      </section>

      {/* ====================================================== */}
      {/* ACTIVIDAD RECIENTE */}
      {/* ====================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Actividad reciente
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Últimas operaciones realizadas.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <RecentActivity activities={activities.slice(0, 5)} />

          <RecentSalesTable sales={recentSales.slice(0, 5)} />
        </div>
      </section>
    </div>
  );
}
