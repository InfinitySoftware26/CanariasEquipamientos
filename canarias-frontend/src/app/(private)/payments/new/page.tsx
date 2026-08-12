"use client";

import { PaymentForm } from "@/components/payments/PaymentForm";

export default function NewPaymentPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Registrar pago</h1>

        <p className="mt-2 text-white/60">
          Registrar un nuevo cobro realizado.
        </p>
      </div>

      <PaymentForm />
    </div>
  );
}
