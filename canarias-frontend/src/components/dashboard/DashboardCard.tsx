import { DashboardCardProps } from "@/types/sellerDashboardKpis.type";

export function DashboardCard({
  title,
  description,
  icon,
  onClick,
  secondaryAction,
}: DashboardCardProps) {
  return (
    <div className="p-4 border rounded space-y-2">
      <div onClick={onClick} className="cursor-pointer">
        {icon}
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      {secondaryAction && (
        <button
          className="text-sm text-blue-500"
          onClick={secondaryAction.onClick}
        >
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
}
