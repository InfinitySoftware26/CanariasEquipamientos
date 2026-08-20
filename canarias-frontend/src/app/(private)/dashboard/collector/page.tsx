"use client";

import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Map,
  Route,
  Truck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { useAuthStore } from "@/store/auth.store";
import { useCollectorDashboard } from "@/hooks/collector/useCollectorDashboard";
import { useCollectorSales } from "@/hooks/collector/useCollectorSale";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CollectorDashboard() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);

  const { sales } = useCollectorSales();

  const { stats, alerts } = useCollectorDashboard(sales);

  return (
    <div className="space-y-8">
      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#10254A] via-[#16315F] to-[#21457A] p-8 shadow-xl">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#F5A300]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="rounded-full bg-[#F5A300]/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#F5A300]">
              Dashboard del cobrador
            </span>

            <h1 className="mt-4 text-4xl font-bold text-white">
              Bienvenido{" "}
              <span className="text-[#F5A300]">{user?.name ?? "Cobrador"}</span>
            </h1>

            <p className="mt-3 max-w-2xl text-white/70">
              Gestioná visitas, entregas, cobranzas y hojas de ruta desde un
              único lugar.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => router.push("/route-sheets/collector")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:bg-white/10"
            >
              <Route className="mb-2 text-[#F5A300]" />

              <p className="font-semibold text-white">Mi hoja de ruta</p>

              <span className="text-sm text-white/60">Ver recorridos</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/collections")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:bg-white/10"
            >
              <DollarSign className="mb-2 text-emerald-400" />

              <p className="font-semibold text-white">Cobros</p>

              <span className="text-sm text-white/60">Registrar pagos</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          KPIs
      ========================================================= */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Estado de la jornada
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Resumen de las operaciones asignadas al cobrador.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Visitas pendientes" value={stats.pendingVisit} />

          <KpiCard title="Entregas pendientes" value={stats.pendingDelivery} />

          <KpiCard title="Operaciones rechazadas" value={stats.rejected} />

          <KpiCard title="Total asignadas" value={sales.length} />
        </div>
      </section>

      {/* =========================================================
          ACCIONES RÁPIDAS
      ========================================================= */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Acciones rápidas</h2>

          <p className="mt-1 text-sm text-white/50">
            Accedé rápidamente a las tareas más frecuentes de la jornada.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Registrar pago"
            description="Registrar una cobranza"
            icon={<DollarSign size={22} />}
            onClick={() => router.push("/collections")}
          />

          <DashboardCard
            title="Registrar entrega"
            description="Gestionar entregas pendientes"
            icon={<Truck size={22} />}
            onClick={() =>
              router.push("/sales/collector?status=PENDING_DELIVERY")
            }
          />

          <DashboardCard
            title="Mi hoja de ruta"
            description="Gestionar recorridos"
            icon={<Route size={22} />}
            onClick={() => router.push("/route-sheets/collector")}
          />

          <DashboardCard
            title="Cerrar jornada"
            description="Gestionar el cierre diario"
            icon={<CheckCircle2 size={22} />}
            onClick={() => router.push("/closures")}
          />
        </div>
      </section>

      {/* =========================================================
          OPERACIÓN
      ========================================================= */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Gestión operativa
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Accedé directamente a las operaciones que requieren atención.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <DashboardCard
            title="Visitas ambientales"
            description="Consultar visitas pendientes de realizar"
            icon={<Users size={22} />}
            onClick={() =>
              router.push("/sales/collector?status=PENDING_ENVIRONMENTAL_VISIT")
            }
          />

          <DashboardCard
            title="Recorrido del día"
            description="Consultar clientes y recorrido asignado"
            icon={<Map size={22} />}
            onClick={() => router.push("/route-sheets/collector")}
          />
        </div>
      </section>

      {/* =========================================================
          ALERTAS
      ========================================================= */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Alertas operativas
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Situaciones que requieren atención durante la jornada.
          </p>
        </div>

        {alerts.length === 0 ? (
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-400" size={22} />

              <div>
                <p className="font-medium text-emerald-300">
                  No existen alertas pendientes.
                </p>

                <p className="mt-1 text-sm text-emerald-200/60">
                  La jornada se encuentra sin incidencias pendientes.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4"
              >
                <AlertTriangle className="shrink-0 text-amber-400" size={20} />

                <span className="text-sm text-amber-200">{alert}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
