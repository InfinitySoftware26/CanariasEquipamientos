interface DashboardCardProps {
  title: string;
  value: string;
}

export function DashboardCard({ title, value }: DashboardCardProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/5
        p-5
      "
    >
      <p className="text-sm text-white/50">{title}</p>

      <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
    </div>
  );
}
