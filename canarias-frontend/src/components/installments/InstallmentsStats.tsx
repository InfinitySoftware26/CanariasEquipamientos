"use client";

interface Props {
  stats: {
    total: number;
    amountDue: number;
    overdue: number;
    partial: number;
  };
}

export function InstallmentsStats({ stats }: Props) {
  const cards = [
    {
      title: "Cuotas",
      value: stats.total,
    },
    {
      title: "Saldo adeudado",
      value: `$ ${stats.amountDue.toLocaleString()}`,
    },
    {
      title: "Vencidas",
      value: stats.overdue,
    },
    {
      title: "Parciales",
      value: stats.partial,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-4">
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
