"use client";

import { useRouter } from "next/navigation";

import { Sale } from "@/types/sales/sale.type";

import { getSaleStatusLabel } from "@/lib/sales/getSalesStatusLabel";
import { getDisplayCode } from "@/lib/sales/displayCode";

import { SaleStatusBadge } from "./SalesStatusBadge";

interface Props {
  sale: Sale;
  isSeller?: boolean;
}

interface Props {
  sale: Sale;
  isSeller?: boolean;
}

export function SaleRow({ sale, isSeller }: Props) {
  const router = useRouter();

  const badge = getSaleStatusLabel(sale.status);

  const product =
    sale.products?.map((p) => p.product?.name ?? p.productId).join(", ") || "-";

  return (
    <tr
      onClick={() => router.push(`/sales/${sale.saleId}`)}
      className="cursor-pointer border-b border-white/5 transition-all hover:bg-white/5"
    >
      <td className="px-3 py-4">
        <span className="inline-block text-sm font-semibold tracking-widest text-yellow-400 sm:text-base">
          {getDisplayCode("VTA", sale.saleId)}
        </span>
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-xs md:px-6 md:py-5 md:text-sm">
        {sale.client ? `${sale.client.name} ${sale.client.surname}` : "-"}
      </td>

      <td className="max-w-[160px] px-3 py-3 text-xs md:max-w-none md:px-6 md:py-5 md:text-sm">
        <span className="block truncate">{product}</span>
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-xs md:px-6 md:py-5 md:text-sm">
        {new Date(sale.saleDate).toLocaleDateString("es-AR")}
      </td>

      <td className="px-3 py-3 text-center text-xs md:px-6 md:py-5 md:text-sm">
        {sale.installmentsCount}
      </td>

      <td>
        {isSeller
          ? `$ ${Number(sale.sellerCommission).toLocaleString()}`
          : `$ ${Number(sale.totalAmount).toLocaleString()}`}
      </td>

      <td className="w-[240px] px-3 py-3 md:px-6 md:py-5">
        <SaleStatusBadge {...badge} />
      </td>

      <td className="px-3 py-3 text-center md:px-6 md:py-5">
        <span className="text-xl text-white/40 transition group-hover:text-white">
          ›
        </span>
      </td>
    </tr>
  );
}
