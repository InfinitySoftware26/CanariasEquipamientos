export type PaymentFrequency = "weekly" | "monthly";

export interface PreloadFormData {
  // 🧑 Cliente
  clientId?: string; // 👈 IMPORTANTE (te faltaba y es clave)
  name: string;
  surname: string;
  documentNumber: string;
  address: string;
  email: string;
  locality: string;
  phone: string;

  // 💰 Venta
  productId: string;
  quantity: number;
  installmentsCount: number;
  paymentFrequency: PaymentFrequency;
  firstDueDate: string;

  // 📞 Referencias
  ref1Phone: string;
  ref1Relationship: string;
  ref1Address: string;
  ref2Phone: string;
  ref2Relationship: string;
  ref2Address: string;
}
