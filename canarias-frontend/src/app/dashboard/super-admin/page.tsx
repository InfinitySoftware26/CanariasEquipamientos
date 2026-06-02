import { DashboardCard } from "@/components/dashboard/DashboardCard";

export default function SuperAdminDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dashboard Global</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard title="Sociedades" value="0" />
        <DashboardCard title="Usuarios" value="0" />
        <DashboardCard title="Ventas" value="$0" />
        <DashboardCard title="Cobranza" value="$0" />
      </div>
    </div>
  );
}
