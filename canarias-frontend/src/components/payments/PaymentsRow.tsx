"use client";

import { Payment } from "@/types/payments/payment.types";
import Link from "next/link";

interface Props {
  payment: Payment;
}

export function PaymentRow({ payment }: Props) {
  return (
    <tr className="border-b border-white/5 transition hover:bg-white/5">
      <td className="px-6 py-4 font-medium text-white">
        {payment.paymentId.slice(0, 8)}
      </td>

      <td className="px-6 py-4 text-white/80">
        {payment.clientId.slice(0, 8)}
      </td>

      <td className="px-6 py-4 text-white/80">{payment.saleId.slice(0, 8)}</td>

      <td className="px-6 py-4 text-white/80">
        {new Date(payment.paymentDate).toLocaleDateString()}
      </td>

      <td className="px-6 py-4 font-semibold text-green-400">
        ${payment.amount.toLocaleString()}
      </td>

      <td className="px-6 py-4">
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize text-white">
          {payment.method.replace("_", " ")}
        </span>
      </td>

      <td className="px-6 py-4">
        <Link
          href={`/payments/${payment.paymentId}`}
          className="rounded-lg bg-[#F5A300] px-3 py-2 text-sm font-medium text-black transition hover:opacity-90"
        >
          Ver
        </Link>
      </td>
    </tr>
  );
}
