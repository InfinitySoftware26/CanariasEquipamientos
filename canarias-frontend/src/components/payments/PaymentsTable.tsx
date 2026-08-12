"use client";

import { Payment } from "@/types/payments/payment.types";
import { PaymentRow } from "./PaymentsRow";

interface Props {
  payments: Payment[];
}

export function PaymentTable({ payments }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0E1726]">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr className="text-left text-xs uppercase tracking-wider text-white/50">
              <th className="px-6 py-4">Pago</th>

              <th className="px-6 py-4">Cliente</th>

              <th className="px-6 py-4">Venta</th>

              <th className="px-6 py-4">Fecha</th>

              <th className="px-6 py-4">Importe</th>

              <th className="px-6 py-4">Método</th>

              <th className="px-6 py-4"></th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment) => (
              <PaymentRow key={payment.paymentId} payment={payment} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
