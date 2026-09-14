import { Client } from "@/types/cretateClient.type";
import { PreloadFormData } from "@/types/preloadForm.type";

// Mapea un cliente existente (traído del lookup) a los campos editables del formulario de precarga
export function mapClientToFormData(
  client: Client,
): Partial<PreloadFormData> {
  return {
    clientId: client.clientId,

    name: client.name ?? "",
    surname: client.surname ?? "",
    address: client.address ?? "",
    phone: client.phone ?? "",
    email: client.email ?? "",
    zoneId: client.zoneId ?? "",

    nameReference1: client.nameReference1 ?? "",
    telReference1: client.telReference1 ?? "",
    addressReference1: client.addressReference1 ?? "",
    nameReference2: client.nameReference2 ?? "",
    telReference2: client.telReference2 ?? "",
    addressReference2: client.addressReference2 ?? "",

    profession: client.profession ?? "",
    monthlyIncome: client.monthlyIncome ?? "",
    paymentMethod: client.paymentMethod ?? "",
    incomeDependents: client.incomeDependents ?? "",
    additionalIncome: client.additionalIncome ?? "",
    housingSituation: client.housingSituation ?? "",
    contractDuration: client.contractDuration ?? "",
    cuil: client.cuil ?? "",
    activeCredit: client.activeCredit ?? false,

    observations: client.observations ?? "",
    societyId: client.societyId ?? "",
  };
}
