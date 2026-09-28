"use client";

import {
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  Phone,
  TriangleAlert,
  User,
  XCircle,
} from "lucide-react";

import { RouteSheetItem } from "@/types/rotue-sheets/routeSheets.types";

import { SaveButton } from "@/components/button/SaveButton";

interface Props {
  item: RouteSheetItem;
  onAction?: () => void;
}

function formatCurrency(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "No disponible";
  }

  const datePart = value.slice(0, 10);

  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function getInstallmentStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "paid":
      return "Pagada";

    case "partial":
      return "Pago parcial";

    case "overdue":
      return "Vencida";

    case "pending":
      return "Pendiente";

    default:
      return status ?? "Pendiente";
  }
}

export function RouteSheetItemCard({ item, onAction }: Props) {
  const isInstallment = item.itemType === "installment";

  const isDelivery = item.itemType === "delivery";

  /*
   * Un DELIVERY puede tener installmentId.
   *
   * En ese caso representa:
   *
   * entrega de producto + cuota 1.
   */
  const hasInstallment = Boolean(item.installmentId);

  const showInstallmentData = isInstallment || (isDelivery && hasInstallment);

  const isPending = item.result === "pending";

  const isCompleted = item.result === "completed";

  const isFailed = item.result === "failed";

  const collectedAmount =
    item.collectedAmount !== null && item.collectedAmount !== undefined
      ? Number(item.collectedAmount)
      : null;

  const installmentAmount = Number(item.installmentAmount ?? 0);

  const remainingAmount =
    item.installmentRemainingAmount !== null &&
    item.installmentRemainingAmount !== undefined
      ? Number(item.installmentRemainingAmount)
      : installmentAmount;

  const lateInterestAmount = Number(item.lateInterestAmount ?? 0);

  const daysLate = Number(item.daysLate ?? 0);

  const totalToCollect =
    item.totalToCollect !== null && item.totalToCollect !== undefined
      ? Number(item.totalToCollect)
      : remainingAmount + lateInterestAmount;

  const hasLateInterest = lateInterestAmount > 0 || daysLate > 0;

  return (
    <article className="rounded-2xl border border-white/10 bg-[#101927] p-5 shadow-lg">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            {isInstallment ? <CreditCard size={22} /> : <Package size={22} />}
          </div>

          <div className="min-w-0">
            <p className="text-xs text-white/40">Cliente</p>

            <p className="truncate text-lg font-semibold text-white">
              {item.clientName || "Cliente no disponible"}
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {isInstallment
            ? "Cobranza"
            : hasInstallment
              ? "Entrega + cuota 1"
              : "Entrega"}
        </span>
      </div>

      {/* CLIENTE */}

      <div className="mt-5 grid gap-4 rounded-xl border border-white/10 bg-black/10 p-4 md:grid-cols-2">
        <div className="flex gap-2">
          <User size={17} className="mt-0.5 shrink-0 text-cyan-400" />

          <div>
            <p className="text-xs text-white/40">Cliente</p>

            <p className="text-sm text-white/80">
              {item.clientName || "No disponible"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-white/40">DNI</p>

          <p className="text-sm text-white/80">
            {item.clientDocumentNumber || "No disponible"}
          </p>
        </div>

        <div className="flex gap-2">
          <MapPin size={17} className="mt-0.5 shrink-0 text-cyan-400" />

          <div>
            <p className="text-xs text-white/40">Dirección</p>

            <p className="text-sm text-white/80">
              {item.clientAddress || "No disponible"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Phone size={17} className="mt-0.5 shrink-0 text-cyan-400" />

          <div>
            <p className="text-xs text-white/40">Teléfono</p>

            <p className="text-sm text-white/80">
              {item.clientPhone || "No disponible"}
            </p>
          </div>
        </div>
      </div>

      {/* CUOTA */}

      {showInstallmentData && (
        <div className="mt-5 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-white/40">Cuota</p>

              <p className="mt-1 font-semibold text-white">
                {item.installmentNumber
                  ? `N.º ${item.installmentNumber}`
                  : isDelivery
                    ? "Cuota 1"
                    : "Pendiente"}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/40">Importe original</p>

              <p className="mt-1 font-semibold text-white">
                {formatCurrency(installmentAmount)}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/40">Vencimiento</p>

              <p className="mt-1 text-sm text-white/80">
                {formatDate(item.installmentDueDate)}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/40">Estado</p>

              <p
                className={`mt-1 text-sm font-semibold ${
                  item.installmentStatus === "overdue"
                    ? "text-red-300"
                    : item.installmentStatus === "partial"
                      ? "text-orange-300"
                      : item.installmentStatus === "paid"
                        ? "text-emerald-300"
                        : "text-yellow-300"
                }`}
              >
                {getInstallmentStatusLabel(item.installmentStatus)}
              </p>
            </div>
          </div>

          {/* RESUMEN COBRO */}

          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-black/15 p-3">
                <p className="text-xs text-white/40">Capital pendiente</p>

                <p className="mt-1 text-base font-semibold text-white">
                  {formatCurrency(remainingAmount)}
                </p>
              </div>

              <div
                className={`rounded-xl p-3 ${
                  hasLateInterest
                    ? "border border-red-500/20 bg-red-500/10"
                    : "bg-black/15"
                }`}
              >
                <p className="text-xs text-white/40">Mora</p>

                <p
                  className={`mt-1 text-base font-semibold ${
                    hasLateInterest ? "text-red-300" : "text-white"
                  }`}
                >
                  {formatCurrency(lateInterestAmount)}
                </p>

                {daysLate > 0 && (
                  <p className="mt-1 text-xs text-red-300/70">
                    {daysLate} {daysLate === 1 ? "día" : "días"} de atraso
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-xs text-white/40">Total a cobrar</p>

                <p className="mt-1 text-lg font-bold text-emerald-300">
                  {formatCurrency(totalToCollect)}
                </p>
              </div>
            </div>
          </div>

          {hasLateInterest && (
            <div className="mt-4 flex gap-2 rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
              <TriangleAlert
                size={17}
                className="mt-0.5 shrink-0 text-orange-300"
              />

              <p className="text-xs leading-relaxed text-orange-200/80">
                Esta cuota tiene mora pendiente. El total a cobrar incluye
                capital más mora.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VENTA */}

      {item.sale && (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="mb-3 text-sm font-semibold text-white">
            Información de la venta
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-white/40">Total venta</p>

              <p className="font-semibold text-white">
                {formatCurrency(Number(item.sale.totalAmount ?? 0))}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/40">Importe cuota</p>

              <p className="font-semibold text-white">
                {formatCurrency(Number(item.sale.installmentAmount ?? 0))}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/40">Cantidad de cuotas</p>

              <p className="font-semibold text-white">
                {item.sale.installmentsCount ?? "—"}
              </p>
            </div>
          </div>

          {item.sale.products && item.sale.products.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-white/40">Productos</p>

              <div className="space-y-2">
                {item.sale.products.map((product, index) => (
                  <div
                    key={product.saleProductId ?? `${item.itemId}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {product.product?.name ?? "Producto"}
                      </p>

                      {product.product?.brand && (
                        <p className="text-xs text-white/40">
                          {product.product.brand}
                        </p>
                      )}
                    </div>

                    <span className="text-sm text-white">
                      x{product.quantity ?? 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESULTADO */}

      <div className="mt-5">
        <span className="text-sm text-white/50">Resultado:</span>

        {isPending && (
          <span className="ml-2 font-semibold text-yellow-300">Pendiente</span>
        )}

        {isCompleted && (
          <span className="ml-2 inline-flex items-center gap-1 font-semibold text-emerald-400">
            <CheckCircle2 size={16} />

            {isInstallment ? "Pago recibido" : "Entrega realizada"}
          </span>
        )}

        {isFailed && (
          <span className="ml-2 inline-flex items-center gap-1 font-semibold text-red-400">
            <XCircle size={16} />
            Visita fallida
          </span>
        )}
      </div>

      {/* MONTO COBRADO */}

      {showInstallmentData && collectedAmount !== null && (
        <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <p className="text-xs text-white/50">Monto recibido</p>

          <p className="mt-1 text-lg font-bold text-emerald-400">
            {formatCurrency(collectedAmount)}
          </p>
        </div>
      )}

      {/* ACTION */}

      {isPending && (
        <div className="mt-5 flex justify-end">
          <SaveButton
            onClick={onAction}
            size="sm"
            className="inline-flex px-4 py-2"
          >
            {isInstallment
              ? "Registrar cobro"
              : hasInstallment
                ? "Registrar entrega + cuota 1"
                : "Confirmar entrega"}
          </SaveButton>
        </div>
      )}

      {/* COMPLETED */}

      {isCompleted && (
        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <p className="text-sm font-medium text-emerald-400">
            ✓{" "}
            {isInstallment
              ? "Pago registrado correctamente"
              : hasInstallment
                ? "Entrega y cobro registrados correctamente"
                : "Entrega registrada correctamente"}
          </p>
        </div>
      )}

      {/* FAILED */}

      {isFailed && (
        <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-sm font-medium text-red-400">
            Visita marcada como fallida
          </p>

          {item.notes && (
            <p className="mt-1 text-sm text-white/60">{item.notes}</p>
          )}
        </div>
      )}
    </article>
  );
}
