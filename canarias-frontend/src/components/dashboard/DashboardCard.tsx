import { ReactNode } from "react";

export interface DashboardCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;

  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function DashboardCard({
  title,
  description,
  icon,
  onClick,
  secondaryAction,
}: DashboardCardProps) {
  return (
    <div className="p-4 border rounded space-y-2 hover:shadow transition">
      <div onClick={onClick} className="cursor-pointer">
        <div className="mb-2">{icon}</div>

        <h3 className="font-medium text-white">{title}</h3>

        <p className="text-sm text-white/60">{description}</p>
      </div>

      {secondaryAction && (
        <button
          className="text-sm text-blue-400 hover:underline"
          onClick={secondaryAction.onClick}
        >
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
}
