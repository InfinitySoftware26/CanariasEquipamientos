"use client";

import Link from "next/link";

import { Installment } from "@/types/installments/installment.types";
import { InstallmentList } from "@/components/installments/InstallmentList";

interface Props {
  clientId: string;
  installments: Installment[];
  loading: boolean;
}

const MAX_VISIBLE = 5;

export function ClientInstallmentsSection({
  clientId,
  installments,
  loading,
}: Props) {
  const visible = installments.slice(0, MAX_VISIBLE);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Cuotas</h3>

        {installments.length > MAX_VISIBLE && (
          <Link
            href={`/installments?clientId=${clientId}`}
            className="text-sm font-medium text-[#F5A300] hover:underline"
          >
            Ver todas
          </Link>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#0E1726] p-6 text-center">
          <p className="text-white/60">Este cliente no tiene cuotas.</p>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <InstallmentList installments={visible} showClient={false} />
      )}
    </section>
  );
}
