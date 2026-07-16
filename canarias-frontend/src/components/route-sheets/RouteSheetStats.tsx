interface Props {
  total: number;
  pending: number;
  progress: number;
  completed: number;
}

export function RouteSheetStats({
  total,
  pending,
  progress,
  completed,
}: Props) {
  const stats = [
    {
      label: "Total",
      value: total,
    },
    {
      label: "Pendientes",
      value: pending,
    },
    {
      label: "En recorrido",
      value: progress,
    },
    {
      label: "Completadas",
      value: completed,
    },
  ];

  return (
    <div
      className="
grid
grid-cols-2
md:grid-cols-4
gap-4
"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="
rounded-3xl
border
border-white/10
bg-white/5
p-5
"
        >
          <p className="text-gray-400 text-sm">{stat.label}</p>

          <p className="text-3xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
