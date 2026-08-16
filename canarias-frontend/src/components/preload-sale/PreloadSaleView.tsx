"use client";

import { PreloadSaleViewProps } from "@/types/preload-sale/preload.type";
import { StepClient } from "./StepClient";
import { StepClientData } from "./StepClientData";
import { StepSale } from "./StepSale";
import { createPreloadClient } from "@/services/client.service";
import { Client } from "@/types/cretateClient.type";
import { InfoDialog } from "@/components/ui/info-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  searched,
  zones,
  infoOpen,
  infoMessage,
  closeInfo,

  clientConfirmOpen,
  setClientConfirmOpen,
  clientConfirmType,
  confirmClientSelection,
}: PreloadSaleViewProps) {
  const handleGoToSaleStep = async () => {
    try {
      let clientId = form.clientId;

      // Si no existe cliente, lo creamos antes de pasar a la venta
      if (!clientId) {
        const created: Client = await createPreloadClient({
          // Básicos
          name: form.name || undefined,
          surname: form.surname || undefined,
          documentNumber: form.documentNumber || undefined,
          phone: form.phone || undefined,
          address: form.address || undefined,
          email: form.email || undefined,
          zoneId: form.zoneId || undefined,

          // Referencias (requeridas en backend)
          nameReference1: form.nameReference1,
          telReference1: form.telReference1,
          addressReference1: form.addressReference1,
          nameReference2: form.nameReference2,
          telReference2: form.telReference2,
          addressReference2: form.addressReference2,

          // Socioeconómicos
          profession: form.profession || undefined,
          monthlyIncome: form.monthlyIncome || undefined,
          paymentMethod: form.paymentMethod || undefined,
          incomeDependents: form.incomeDependents || undefined,
          additionalIncome: form.additionalIncome || undefined,
          housingSituation: form.housingSituation || undefined,
          contractDuration: form.contractDuration || undefined,
          cuil: form.cuil || undefined,
          activeCredit: form.activeCredit ?? false,

          // Observaciones
          observations: form.observations || undefined,

          societyId: form.societyId || undefined,
        });

        clientId = created.clientId;

        setForm({
          ...form,
          clientId,
        });
      }

      goToSaleStep();
    } catch (e) {
      console.error("Error creando cliente:", e);
    }
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <StepClient
          form={form}
          setForm={setForm}
          handleSearchClient={handleSearchClient}
          clientFound={clientFound}
          searched={searched}
        />
      )}

      {step === 2 && (
        <>
          <StepClientData form={form} setForm={setForm} zones={zones} />

          <button
            onClick={handleGoToSaleStep}
            className="w-full rounded-xl bg-[#F5A300] py-2 font-semibold text-[#0D1B2A]"
          >
            Continuar a la venta
          </button>
        </>
      )}

      {/* Confirmación luego de buscar el cliente */}
      <ConfirmDialog
        open={clientConfirmOpen}
        onOpenChange={setClientConfirmOpen}
        title={
          clientConfirmType === "existing"
            ? "Cliente seleccionado"
            : "Cliente no registrado"
        }
        description={
          clientConfirmType === "existing"
            ? `Se utilizará al cliente ${form.name ?? ""} ${
                form.surname ?? ""
              } (DNI ${form.documentNumber ?? "-"}) en esta venta.`
            : "El cliente no se encuentra registrado. Si continúa, se procederá a solicitar sus datos para crear el cliente."
        }
        confirmText="Continuar"
        cancelText="Cancelar"
        onConfirm={confirmClientSelection}
      />

      {/* Diálogo informativo existente */}
      <InfoDialog
        open={infoOpen}
        onOpenChange={closeInfo}
        title={infoMessage?.title ?? "Información"}
        description={infoMessage?.description ?? ""}
        actionText={infoMessage?.actionText ?? "Aceptar"}
      />

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
