"use client";

interface Props {
  stats: {
    total: number;
    pending: number;
    validated: number;
    rejected: number;
    totalDeclared: number;
  };
}

export function ClosureStats({ stats }: Props) {
  const cards = [
    { title: "Cierres", value: stats.total },
    { title: "Pendientes", value: stats.pending },
    { title: "Aprobados", value: stats.validated },
    { title: "Rechazados", value: stats.rejected },
    {
      title: "Total declarado",
      value: `$ ${stats.totalDeclared.toLocaleString()}`,
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
