"use client";

import { ClipboardCheck, Truck, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { KpiCard } from "@/components/dashboard/KpiCard";

import { useAuthStore } from "@/store/auth.store";
import { getSales } from "@/services/sales.service";

import { Pipeline, Sale } from "@/types/sales/sale.type";

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<Pipeline>({
    adminValidation: 0,
    envVisit: 0,
    delivery: 0,
    closed: 0,
    rejected: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const sales: Sale[] = await getSales();

        const nextStats: Pipeline = {
          adminValidation: 0,
          envVisit: 0,
          delivery: 0,
          closed: 0,
          rejected: 0,
        };

        sales.forEach((sale) => {
          switch (sale.status) {
            case "pending_admin_validation":
              nextStats.adminValidation++;
              break;

            case "pending_environmental_visit":
              nextStats.envVisit++;
              break;

            case "pending_delivery":
              nextStats.delivery++;
              break;

            case "closed":
              nextStats.closed++;
              break;

            case "rejected_admin":
            case "environmental_rejected":
              nextStats.rejected++;
              break;
          }
        });

        setStats(nextStats);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#10254A] via-[#16315F] to-[#21457A] p-8">
        <h1 className="text-3xl font-bold text-white">
          Bienvenido{" "}
          <span className="text-[#F5A300]">
            {user?.name ?? "Administrador"}
          </span>{" "}
          👋
        </h1>

        <p className="mt-3 text-white/70">
          Control y seguimiento de operaciones comerciales.
        </p>
      </section>

      {/* KPIS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Estado del proceso comercial
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard title="Pend. Validación" value={stats.adminValidation} />

          <KpiCard title="Pend. Visita" value={stats.envVisit} />

          <KpiCard title="Pend. Entrega" value={stats.delivery} />

          <KpiCard title="Cerradas" value={stats.closed} />

          <KpiCard title="Rechazadas" value={stats.rejected} />
        </div>
      </section>

      {/* ALERTAS */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">
          Alertas administrativas
        </h2>

        {stats.adminValidation > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-300">
              ⚠ Existen {stats.adminValidation} ventas pendientes de validación.
            </p>
          </div>
        )}

        {stats.envVisit > 0 && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">
              ⚠ Hay {stats.envVisit} visitas pendientes de coordinación.
            </p>
          </div>
        )}
      </section>

      {/* ACCIONES */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Acciones rápidas</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Validar ventas"
            description="Aprobar o rechazar ventas"
            icon={<ClipboardCheck size={22} />}
            onClick={() =>
              router.push("/sales?status=PENDING_ADMIN_VALIDATION")
            }
          />

          <DashboardCard
            title="Coordinar visitas"
            description="Ventas pendientes de visita"
            icon={<Truck size={22} />}
            onClick={() =>
              router.push("/sales?status=PENDING_ENVIRONMENTAL_VISIT")
            }
          />

          <DashboardCard
            title="Coordinar entregas"
            description="Ventas listas para entregar"
            icon={<CheckCircle2 size={22} />}
            onClick={() => router.push("/sales?status=PENDING_DELIVERY")}
          />

          <DashboardCard
            title="Ventas rechazadas"
            description="Revisar operaciones rechazadas"
            icon={<XCircle size={22} />}
            onClick={() => router.push("/sales?status=REJECTED_ADMIN")}
          />
        </div>
      </section>
    </div>
  );
}
