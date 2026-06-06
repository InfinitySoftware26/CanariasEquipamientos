"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useAuthStore } from "@/store/auth.store";

export default function SellerDashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Bienvenido {user?.name}</h1>
      <p className="text-muted-foreground">
        Te deseamos una excelente jornada de trabajo.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Clientes" value="0" />
        <DashboardCard title="Ventas Mes" value="$0" />
        <DashboardCard title="Pendientes" value="0" />
      </div>
    </div>
  );
}
