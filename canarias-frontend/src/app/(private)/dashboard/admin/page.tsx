import { DashboardCard } from "@/components/dashboard/DashboardCard";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dashboard Administrativo</h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Clientes" value="0" />
        <DashboardCard title="Productos" value="0" />
        <DashboardCard title="Proveedores" value="0" />
        <DashboardCard title="Stock Bajo" value="0" />
      </div>
    </div>
  );
}
