"use client";

import { PreloadSaleViewProps } from "@/types/preload-sale/preload.type";
import { StepClient } from "./StepClient";
import { StepClientData } from "./StepClientData";
import { StepSale } from "./StepSale";

export function PreloadSaleView({
  step,
  form,
  setForm,
  products,
  clientFound,
  error,
  loading,
  handleSearchClient,
  handleSubmit,
  goToSaleStep,
}: PreloadSaleViewProps) {
  return (
    <div className="pb-24 space-y-6">
      {step === 1 && (
        <StepClient
          form={form}
          setForm={setForm}
          handleSearchClient={handleSearchClient}
          clientFound={clientFound}
        />
      )}

      {step === 2 && (
        <>
          <StepClientData form={form} setForm={setForm} />

          <button
            onClick={goToSaleStep}
            className="w-full rounded-xl bg-[#F5A300] py-2 font-semibold text-[#0D1B2A]"
          >
            Continuar a la venta
          </button>
        </>
      )}

      {step === 3 && (
        <StepSale
          form={form}
          setForm={setForm}
          products={products}
          handleSubmit={handleSubmit}
          loading={loading}
        />
      )}

      {error && <p className="text-red-400">{error}</p>}
    </div>
  );
}
