interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

export function KpiCard({
  title,
  value,
  icon,
  trend = "neutral",
}: KpiCardProps) {
  const trendColor =
    trend === "up"
      ? "text-green-400"
      : trend === "down"
        ? "text-red-400"
        : "text-white/60";

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-white/5
        p-5
        backdrop-blur-xl
        transition
        hover:bg-white/[0.07]
      "
    >
      {/* ICON */}
      {icon && <div className="mb-3 text-[#ffa408]">{icon}</div>}

      {/* TITLE */}
      <p className="text-sm text-white/50">{title}</p>

      {/* VALUE */}
      <h3 className={`mt-2 text-3xl font-bold ${trendColor}`}>{value}</h3>

      {/* DECORATIVE GLOW */}
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#ffa408]/10 blur-2xl" />
    </div>
  );
}
