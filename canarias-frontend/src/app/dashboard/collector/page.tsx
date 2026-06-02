import { DashboardCard } from "@/components/dashboard/DashboardCard";

export default function CollectorDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dashboard Cobrador</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard title="Cobros Hoy" value="0" />
        <DashboardCard title="Pendientes" value="0" />
        <DashboardCard title="Clientes" value="0" />
        <DashboardCard title="Visitas" value="0" />
      </div>
    </div>
  );
}
