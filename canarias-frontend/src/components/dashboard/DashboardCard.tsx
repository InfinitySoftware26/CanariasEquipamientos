interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  value?: string | number;
  onClick?: () => void;
}

export function DashboardCard({
  title,
  description,
  icon,
  value,
  onClick,
}: DashboardCardProps) {
  return (
    <button
      onClick={onClick}
      className="
        group
        w-full
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        p-6
        text-left
        backdrop-blur-xl
        transition-all
        hover:border-[#ffa408]/40
        hover:bg-white/[0.07]
        hover:-translate-y-1
      "
    >
      <div className="mb-4 text-[#ffa408]">{icon}</div>

      <h3 className="text-lg font-semibold text-white">{title}</h3>

      {value !== undefined && (
        <p className="mt-2 text-2xl font-bold text-white">
          {typeof value === "number" ? `$${value.toFixed(2)}` : value}
        </p>
      )}

      {description && (
        <p className="mt-2 text-sm text-white/60">{description}</p>
      )}
    </button>
  );
}
