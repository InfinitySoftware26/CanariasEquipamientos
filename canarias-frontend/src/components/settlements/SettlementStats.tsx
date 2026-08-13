"use client";

interface Props {
  stats: {
    total: number;
    pending: number;
    validated: number;
    rejected: number;
    totalOutstanding: number;
  };
}

export function SettlementStats({ stats }: Props) {
  const cards = [
    { title: "Liquidaciones", value: stats.total },
    { title: "Pendientes", value: stats.pending },
    { title: "Aprobadas", value: stats.validated },
    { title: "Rechazadas", value: stats.rejected },
    {
      title: "Deuda pendiente",
      value: `$ ${stats.totalOutstanding.toLocaleString()}`,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-3xl border border-white/10 bg-[#0E1726] p-6"
        >
          <p className="text-sm text-white/50">{card.title}</p>

          <h3 className="mt-3 text-3xl font-bold text-white">{card.value}</h3>
        </div>
      ))}
    </section>
  );
}
