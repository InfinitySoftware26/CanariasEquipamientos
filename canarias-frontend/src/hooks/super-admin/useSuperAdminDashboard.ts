export function useSuperAdminDashboard() {
  const stats = {
    totalUsers: 0,
    activeSales: 0,
    pendingSales: 0,
    closedSales: 0,
  };

  const alerts: string[] = [];

  return { stats, alerts };
}
