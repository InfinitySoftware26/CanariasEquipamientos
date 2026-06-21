import { DashboardCard } from "@/components/dashboard/DashboardCard";

export default function CollectorDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dashboard Cobrador</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard
          title="Cobros Hoy"
          description="0"
          icon={<span>💰</span>}
          onClick={() => {}}
        />

        <DashboardCard
          title="Pendientes"
          description="0"
          icon={<span>📌</span>}
          onClick={() => {}}
        />

        <DashboardCard
          title="Clientes"
          description="0"
          icon={<span>👥</span>}
          onClick={() => {}}
        />

        <DashboardCard
          title="Visitas"
          description="0"
          icon={<span>🚚</span>}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}
