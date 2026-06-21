export interface DashboardKpis {
  salesToday: number;
  dailyCommission: number;
  monthlyCommission: number;
  pendingClients: number;
  approvedSales: number;
}

import { ReactNode } from "react";

export interface DashboardCardProps {
  title: string;
  value: string | number;

  description?: string;
  icon?: ReactNode;

  onClick?: () => void;

  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}
