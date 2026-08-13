"use client";

import { Installment } from "@/types/installments/installment.types";

interface Props {
  installment: Installment;
  showClient: boolean;
  showSale: boolean;
  onPay?: (installment: Installment) => void;
}

const STATUS_LABELS: Record<Installment["status"], string> = {
  pending: "Pendiente",
  paid: "Pagada",
  overdue: "Vencida",
  partial: "Parcial",
  defaulted: "Incobrable",
};

const STATUS_STYLES: Record<Installment["status"], string> = {
  pending: "bg-slate-800 text-white",
  paid: "bg-green-500/15 text-green-400",
  overdue: "bg-red-500/15 text-red-400",
  partial: "bg-[#F5A300]/15 text-[#F5A300]",
  defaulted: "bg-red-900/30 text-red-300",
};

// El backend aún no expone el nombre del cliente/venta en installments; se
// muestra el id truncado hasta que el endpoint lo incluya (deuda técnica).
function truncateId(id: string) {
  return `${id.slice(0, 8)}...`;
}

export function InstallmentRow({
  installment,
  showClient,
  showSale,
  onPay,
}: Props) {
  const canPay =
    installment.status !== "paid" && installment.remainingAmount > 0;

  return (
    <tr className="border-b border-white/5 transition hover:bg-white/5">
      <td className="px-6 py-4 font-medium text-white">
        #{installment.installmentNumber}
      </td>

      {showClient && (
        <td className="px-6 py-4 text-white/80">
          {truncateId(installment.clientId)}
        </td>
      )}

      {showSale && (
        <td className="px-6 py-4 text-white/80">
          {truncateId(installment.saleId)}
        </td>
      )}

      <td className="px-6 py-4 text-white/80">
        $ {Number(installment.amount).toLocaleString()}
      </td>

      <td className="px-6 py-4 font-semibold text-white">
        $ {Number(installment.remainingAmount).toLocaleString()}
      </td>

      <td className="px-6 py-4 text-white/80">
        {new Date(installment.dueDate).toLocaleDateString()}
      </td>

      <td className="px-6 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[installment.status]}`}
        >
          {STATUS_LABELS[installment.status]}
        </span>
      </td>

      <td className="px-6 py-4">
        {onPay && canPay && (
          <button
            onClick={() => onPay(installment)}
            className="rounded-lg bg-[#F5A300] px-3 py-2 text-sm font-medium text-black transition hover:opacity-90"
          >
            Registrar pago
          </button>
        )}
      </td>
    </tr>
  );
}
