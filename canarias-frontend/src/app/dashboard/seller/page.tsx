import { DashboardCard } from "@/components/dashboard/DashboardCard";

export default function SellerDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dashboard Vendedor</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Clientes" value="0" />
        <DashboardCard title="Ventas Mes" value="$0" />
        <DashboardCard title="Pendientes" value="0" />
      </div>
    </div>
  );
}
