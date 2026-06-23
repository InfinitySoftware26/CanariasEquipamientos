"use client";

import {
  Users,
  Truck,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Shield,
  Activity,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { KpiCard } from "@/components/dashboard/KpiCard";

import { useAuthStore } from "@/store/auth.store";
import { useSuperAdminDashboard } from "@/hooks/super-admin/useSuperAdminDashboard";

export default function SuperAdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const { stats, alerts } = useSuperAdminDashboard();

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#0B1B3A] via-[#132B52] to-[#1F3E73] p-8">
        <h1 className="text-3xl font-bold text-white">
          Panel SuperAdmin{" "}
          <span className="text-[#F5A300]">{user?.name ?? "Admin"}</span> 👑
        </h1>

        <p className="mt-3 text-white/70">
          Control total del sistema: usuarios, ventas, estados y auditoría.
        </p>
      </section>

      {/* KPI GLOBAL */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Estado general del sistema
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Usuarios totales" value={stats.totalUsers} />
          <KpiCard title="Ventas activas" value={stats.activeSales} />
          <KpiCard title="Pendientes" value={stats.pendingSales} />
          <KpiCard title="Cerradas" value={stats.closedSales} />
        </div>
      </section>

      {/* ALERTAS */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">
          Alertas del sistema
        </h2>

        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-white/50">Sistema estable. Sin alertas.</p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div
              key={i}
              className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4"
            >
              <p className="text-sm text-red-300">⚠ {alert}</p>
            </div>
          ))
        )}
      </section>

      {/* ACCIONES RÁPIDAS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Acciones globales</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Gestión de usuarios"
            description="Crear, editar y bloquear usuarios"
            icon={<Users size={22} />}
            onClick={() => router.push("/superadmin/users")}
          />

          <DashboardCard
            title="Control de ventas"
            description="Ver todas las operaciones"
            icon={<DollarSign size={22} />}
            onClick={() => router.push("/sales")}
          />

          <DashboardCard
            title="Estados del sistema"
            description="Pipeline completo de ventas"
            icon={<Activity size={22} />}
            onClick={() => router.push("/superadmin/sales")}
          />

          <DashboardCard
            title="Auditoría"
            description="Logs del sistema"
            icon={<Shield size={22} />}
            onClick={() => router.push("/superadmin/logs")}
          />
        </div>
      </section>
    </div>
  );
}
