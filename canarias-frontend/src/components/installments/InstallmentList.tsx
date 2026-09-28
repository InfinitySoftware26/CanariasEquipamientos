"use client";

import { Installment } from "@/types/installments/installment.types";
import { InstallmentRow } from "./InstallmentRow";

interface Props {
  installments: Installment[];
  showClient?: boolean;
  showSale?: boolean;
  onPay?: (installment: Installment) => void;
}

export function InstallmentList({
  installments,
  showClient = true,
  showSale = true,
  onPay,
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0E1726]">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr className="text-left text-xs uppercase tracking-wider text-white/50">
              <th className="px-6 py-4">Cuota</th>

              {showClient && <th className="px-6 py-4">Cliente</th>}

              {showSale && <th className="px-6 py-4">Venta</th>}

              <th className="px-6 py-4">Importe</th>

              <th className="px-6 py-4">Saldo</th>

              <th className="px-6 py-4">Vencimiento</th>

              <th className="px-6 py-4">Estado</th>

              <th className="px-6 py-4"></th>
            </tr>
          </thead>

          <tbody>
            {installments.map((installment) => (
              <InstallmentRow
                key={installment.installmentId}
                installment={installment}
                showClient={showClient}
                showSale={showSale}
                onPay={onPay}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
