"use client";

import { DollarSign, Users, ShoppingCart } from "lucide-react";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";

import { useSellerDashboard } from "@/hooks/seller/useSellerDashboard";

import { KpiCard } from "@/components/dashboard/KpiCard";

import { PipelineCard } from "@/components/dashboard/PipelineCard";

import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { DashboardHero } from "@/components/dashboard/DashboardHero";

export default function SellerDashboard() {
  const user = useAuthStore((state) => state.user);

  const router = useRouter();

  const { kpis, pipeline, alerts } = useSellerDashboard();

  return (
    <div className="space-y-10">
      {/* HERO */}

      <DashboardHero
        title={`Buen día ${user?.name ?? "Usuario"} 👋`}
        subtitle="
Este es tu resumen comercial. Revisá tus ventas pendientes y continuá tu gestión.
"
        action={
          <button
            onClick={() => router.push("/sales/preload")}
            className="
rounded-xl
bg-[#ffa408]
px-5
py-3
font-semibold
text-black
transition
hover:scale-105
"
          >
            + Nueva venta
          </button>
        }
      />
      {/* KPIS */}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Resumen del día</h2>

        <div
          className="
grid
grid-cols-1
gap-4
md:grid-cols-2
xl:grid-cols-4
"
        >
          <KpiCard title="Ventas realizadas" value={kpis.salesToday} />

          <KpiCard title="Ventas aprobadas" value={kpis.approvedSales} />

          <KpiCard title="Clientes pendientes" value={kpis.pendingClients} />

          <KpiCard
            title="Comisión mensual"
            value={`$${kpis.monthlyCommission.toLocaleString("es-AR")}`}
          />
        </div>
      </section>

      {/* PIPELINE */}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Seguimiento de ventas
        </h2>

        <div
          className="
grid
grid-cols-2
gap-4
lg:grid-cols-5
"
        >
          <PipelineCard title="En revisión" value={pipeline.validation} />

          <PipelineCard title="Visita" value={pipeline.visit} />

          <PipelineCard title="Entrega" value={pipeline.delivery} />

          <PipelineCard title="Cerradas" value={pipeline.closed} highlight />

          <PipelineCard title="Rechazadas" value={pipeline.rejected} />
        </div>
      </section>

      {/* ALERTAS */}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Alertas</h2>

        {alerts.length === 0 ? (
          <div
            className="
rounded-2xl
border
border-white/10
bg-white/5
p-5
text-white/50
"
          >
            No tenés alertas pendientes
          </div>
        ) : (
          alerts.map((alert, index) => (
            <div
              key={index}
              className="
rounded-2xl
border
border-amber-500/20
bg-amber-500/10
p-4
text-amber-300
"
            >
              ⚠ {alert}
            </div>
          ))
        )}
      </section>

      {/* QUICK ACTIONS */}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Acciones rápidas</h2>

        <div
          className="
grid
gap-4
md:grid-cols-3
"
        >
          <QuickActionCard
            title="Nueva venta"
            description="Crear operación comercial"
            icon={<ShoppingCart size={22} />}
            onClick={() => router.push("/sales/preload")}
          />

          <QuickActionCard
            title="Mis clientes"
            description="Consultar cartera"
            icon={<Users size={22} />}
            onClick={() => router.push("/client")}
          />

          <QuickActionCard
            title="Mis ventas"
            description="Ver seguimiento"
            icon={<DollarSign size={22} />}
            onClick={() => router.push("/sales/my")}
          />
        </div>
      </section>
    </div>
  );
}
