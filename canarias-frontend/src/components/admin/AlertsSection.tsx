"use client";

interface AlertsSectionProps {
  pipeline: {
    adminValidation: number;
    envVisit: number;
    delivery: number;
    closed: number;
    rejected: number;
  };
}

export function AlertsSection({ pipeline }: AlertsSectionProps) {
  const alerts = [];

  if (pipeline.adminValidation > 0) {
    alerts.push({
      title: "Ventas pendientes de validación",
      description: `${pipeline.adminValidation} ventas requieren aprobación administrativa.`,
      color: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    });
  }

  if (pipeline.envVisit > 0) {
    alerts.push({
      title: "Visitas pendientes",
      description: `${pipeline.envVisit} visitas ambientales esperan coordinación.`,
      color: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    });
  }

  if (pipeline.delivery > 0) {
    alerts.push({
      title: "Entregas pendientes",
      description: `${pipeline.delivery} ventas están listas para entregar.`,
      color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    });
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Alertas</h2>

      <div className="grid gap-4 lg:grid-cols-3">
        {alerts.map((alert) => (
          <div
            key={alert.title}
            className={`rounded-2xl border p-5 ${alert.color}`}
          >
            <h3 className="font-semibold">{alert.title}</h3>

            <p className="mt-2 text-sm opacity-80">{alert.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
