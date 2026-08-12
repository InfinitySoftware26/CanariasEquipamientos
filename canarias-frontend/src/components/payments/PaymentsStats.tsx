"use client";

interface Props {
  stats: {
    total: number;
    amount: number;
    cash: number;
    transfer: number;
  };
}

export function PaymentStats({ stats }: Props) {
  const cards = [
    {
      title: "Pagos",
      value: stats.total,
    },
    {
      title: "Recaudado",
      value: `$ ${stats.amount.toLocaleString()}`,
    },
    {
      title: "Efectivo",
      value: stats.cash,
    },
    {
      title: "Transferencias",
      value: stats.transfer,
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
