export interface DashboardKpis {
  salesToday: number;
  dailyCommission: number;
  monthlyCommission: number;
  pendingClients: number;
  approvedSales: number;
}

export interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;

  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}
