export interface SaleValidation {
  validationId: string;
  saleId: string;
  staffId: string;
  step: "admin_validation" | "environmental_visit" | "delivery";
  status: "pending" | "approved" | "rejected";
  observations: string | null;
  dniCopyReceived: boolean | null;
  contractReceived: boolean | null;
  utilityBillReceived: boolean | null;
  validatedAt: string;
  createdAt: string;
}
