import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function AdminDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>

        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <div className="card-base p-5">
            <p className="text-white/60">Clientes</p>

            <h2 className="mt-2 text-3xl font-bold">128</h2>
          </div>

          <div className="card-base p-5">
            <p className="text-white/60">Cobros Hoy</p>

            <h2 className="mt-2 text-3xl font-bold">$1.250.000</h2>
          </div>

          <div className="card-base p-5">
            <p className="text-white/60">Proveedores</p>

            <h2 className="mt-2 text-3xl font-bold">34</h2>
          </div>

          <div className="card-base p-5">
            <p className="text-white/60">Productos</p>

            <h2 className="mt-2 text-3xl font-bold">512</h2>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
