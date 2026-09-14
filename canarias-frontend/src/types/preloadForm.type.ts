export type PaymentFrequency = "weekly" | "monthly" | "biweekly" | "daily";

export type SaleMode = "plan" | "promotion" | "custom";

export interface PreloadFormData {
  // 🧑 Cliente
  clientId?: string;
  name: string;
  surname: string;
  documentNumber: string;
  address: string;
  email: string;
  locality: string;
  phone: string;
  zoneId: string;

  // 💰 Venta
  saleMode: SaleMode;
  financingPlanId?: string;
  promotionId?: string;

  // En modo personalizado
  customRateType?: "config" | "custom";
  financingConfigId?: string;
  customRate?: string;

  productId: string;
  quantity: number;
  installmentsCount: number;
  paymentFrequency: PaymentFrequency;

  // 🔒 Referencias de garantía
  nameReference1: string;
  addressReference1: string;
  telReference1: string;
  nameReference2: string;
  addressReference2: string;
  telReference2: string;

  // 📞 Referencias adicionales
  ref1Phone: string;
  ref1Relationship: string;
  ref1Address: string;
  ref2Phone: string;
  ref2Relationship: string;
  ref2Address: string;

  // 📊 Datos socioeconómicos
  profession?: string;
  monthlyIncome?: string;
  paymentMethod?: string;
  incomeDependents?: string;
  additionalIncome?: string;
  housingSituation?: string;
  contractDuration?: string;
  cuil?: string;
  activeCredit?: boolean;

  // 📝 Observaciones
  observations?: string;

  societyId?: string;
}

