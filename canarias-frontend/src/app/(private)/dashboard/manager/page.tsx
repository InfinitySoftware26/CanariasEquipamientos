import { DashboardCard } from "@/components/dashboard/DashboardCard";

export default function ManagerDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dashboard Gerente</h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Clientes" value="0" />

        <DashboardCard title="Cobros del mes" value="$0" />

        <DashboardCard title="Empleados" value="0" />

        <DashboardCard title="Mora" value="0%" />
      </div>
    </div>
  );
}
