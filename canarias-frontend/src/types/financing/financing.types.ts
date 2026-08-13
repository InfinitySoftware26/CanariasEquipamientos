export interface FinancingConfig {
  societyId: string;

  rate3: number;

  rate6: number;

  rate9: number;

  maxInstallments: number;
}

export interface UpdateFinancingPayload {
  rate3: number;

  rate6: number;

  rate9: number;

  maxInstallments: number;
}
