"use client";

import { PreloadSaleViewProps } from "@/types/preload-sale/preload.type";
import { StepClient } from "./StepClient";
import { StepClientData } from "./StepClientData";
import { StepSale } from "./StepSale";
import { createPreloadClient } from "@/services/client.service";
import { Client } from "@/types/cretateClient.type";

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
  const handleGoToSaleStep = async () => {
    try {
      let clientId = form.clientId;

      // 🧠 SI NO EXISTE CLIENTE → LO CREAMOS
      if (!clientId) {
        const created: Client = await createPreloadClient({
          name: form.name,
          surname: form.surname,
          documentNumber: form.documentNumber,
          phone: form.phone,
          address: form.address,
        });

        clientId = created.clientId;

        setForm({
          ...form,
          clientId,
        });
      }

      goToSaleStep();
    } catch (e) {
      console.error(e);
    }
  };

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
            onClick={handleGoToSaleStep}
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
