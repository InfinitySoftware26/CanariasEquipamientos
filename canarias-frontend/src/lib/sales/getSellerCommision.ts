import { Sale } from "@/types/sales/sale.type";

export function getMonthlyCommission(sales: Sale[]) {
  const now = new Date();

  return sales.reduce((total, sale) => {
    const saleDate = new Date(sale.saleDate);

    const sameMonth =
      saleDate.getMonth() === now.getMonth() &&
      saleDate.getFullYear() === now.getFullYear();

    if (!sameMonth) {
      return total;
    }

    return total + Number(sale.sellerCommission);
  }, 0);
}
