"use client";

import { useRouter } from "next/navigation";
import { Sale } from "@/types/sales/sale.type";
import { getSaleStatusLabel } from "@/lib/sales/getSalesStatusLabel";
import { SaleStatusBadge } from "./SalesStatusBadge";
import { getDisplayCode } from "@/lib/sales/displayCode";

export function SaleRow({ sale }: { sale: Sale }) {
  const router = useRouter();

  const status = (sale.status ?? "").toUpperCase();
  const badge = getSaleStatusLabel(status);

  const product =
    sale.products?.map((p) => p.product?.name ?? p.productId).join(", ") || "-";

  return (
    <tr
      onClick={() => router.push(`/sales/${sale.saleId}`)}
      className="cursor-pointer border-b border-white/5 transition-all hover:bg-white/5"
    >
      <td className="py-4 px-3">
        <span className="inline-block text-yellow-400 text-sm sm:text-base font-semibold tracking-widest">
          {getDisplayCode("VTA", sale.saleId)}
        </span>
      </td>
      <td className="px-3 py-3 text-xs whitespace-nowrap md:px-6 md:py-5 md:text-sm">
        {sale.client ? `${sale.client.name} ${sale.client.surname}` : "-"}
      </td>

      <td className="max-w-[140px] px-3 py-3 text-xs md:max-w-none md:px-6 md:py-5 md:text-sm">
        <span className="block truncate">{product}</span>
      </td>

      <td className="px-3 py-3 text-xs whitespace-nowrap md:px-6 md:py-5 md:text-sm">
        {new Date(sale.saleDate).toLocaleDateString("es-AR")}
      </td>

      <td className="px-3 py-3 text-center text-xs md:px-6 md:py-5 md:text-sm">
        {sale.installmentsCount}
      </td>

      <td className="px-3 py-3 text-xs font-semibold whitespace-nowrap text-[#F5A300] md:px-6 md:py-5 md:text-sm">
        ${Number(sale.totalAmount).toLocaleString("es-AR")}
      </td>

      <td className="w-[220px] px-3 py-3 md:px-6 md:py-5">
        <SaleStatusBadge {...badge} />
      </td>

      <td className="px-3 py-3 text-center md:px-6 md:py-5">
        <span className="text-white/40">›</span>
      </td>
    </tr>
  );
}
