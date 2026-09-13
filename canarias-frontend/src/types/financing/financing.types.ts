/**
 * Tipos del módulo de Financiación.
 *
 * Refleja exactamente las 3 entidades del backend (módulo `financing`):
 * - FinancingConfiguration: tasa base de financiación (global o por producto)
 * - FinancingPlan: esquema de cuotas + frecuencia de pago (vinculado a una configuración)
 * - Promotion: ganancia adicional / descuento especial (vinculada o no a un plan)
 */

export type PaymentFrequency = "daily" | "weekly" | "biweekly" | "monthly";

export interface FinancingProduct {
  productId: string;
  name: string;
  code?: string;
  price?: number;
}

export interface FinancingConfiguration {
  financingConfigId: string;
  societyId: string;
  name: string;
  financingRate: number;
  isGlobal: boolean;
  isActive: boolean;
  products: FinancingProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface FinancingPlan {
  financingPlanId: string;
  societyId: string;
  name: string;
  financingConfigId: string;
  financingConfiguration?: FinancingConfiguration;
  paymentFrequency: PaymentFrequency;
  installmentsCount: number;
  isGlobal: boolean;
  isActive: boolean;
  products: FinancingProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  promotionId: string;
  societyId: string;
  name: string;
  financingPlanId: string | null;
  plan?: FinancingPlan | null;
  discountPercentage: number | null;
  paymentFrequency: PaymentFrequency | null;
  installmentsCount: number | null;
  isGlobal: boolean;
  isActive: boolean;
  products: FinancingProduct[];
  createdAt: string;
  updatedAt: string;
}

// ─── PAYLOADS: FINANCING CONFIGURATION ──────────────────────────────────────

export interface CreateFinancingConfigPayload {
  name: string;
  financingRate: number;
  isGlobal?: boolean;
  productIds?: string[];
}

export interface UpdateFinancingConfigPayload {
  name?: string;
  financingRate?: number;
  isActive?: boolean;
}

// ─── PAYLOADS: FINANCING PLAN ────────────────────────────────────────────────

export interface CreateFinancingPlanPayload {
  name: string;
  financingConfigId: string;
  paymentFrequency: PaymentFrequency;
  installmentsCount: number;
  isGlobal?: boolean;
  productIds?: string[];
}

export interface UpdateFinancingPlanPayload {
  name?: string;
  financingConfigId?: string;
  paymentFrequency?: PaymentFrequency;
  installmentsCount?: number;
  isGlobal?: boolean;
  productIds?: string[];
}

// ─── PAYLOADS: PROMOTION ─────────────────────────────────────────────────────

export interface CreatePromotionPayload {
  name: string;
  financingPlanId?: string | null;
  discountPercentage?: number | null;
  paymentFrequency?: PaymentFrequency | null;
  installmentsCount?: number | null;
  isGlobal?: boolean;
  productIds?: string[];
}

export interface UpdatePromotionPayload {
  name?: string;
  financingPlanId?: string | null;
  discountPercentage?: number | null;
  paymentFrequency?: PaymentFrequency | null;
  installmentsCount?: number | null;
  isGlobal?: boolean;
  productIds?: string[];
}

export type FinancingTabValue = "configurations" | "plans" | "promotions";

export const PAYMENT_FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  daily: "Diario",
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
};

export const PAYMENT_FREQUENCY_OPTIONS: Array<{
  value: PaymentFrequency;
  label: string;
}> = [
    { value: "daily", label: "Diario" },
    { value: "weekly", label: "Semanal" },
    { value: "biweekly", label: "Quincenal" },
    { value: "monthly", label: "Mensual" },
  ];
