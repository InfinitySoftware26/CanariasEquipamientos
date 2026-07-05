import { FinancingConfiguration } from '../entities/financing-configuration.entity';

export interface IFinancingConfigRepository {
  findBySociety(societyId: string): Promise<FinancingConfiguration | null>;
  upsert(societyId: string, data: Partial<FinancingConfiguration>): Promise<FinancingConfiguration>;
  findByProduct(productId: string): Promise<FinancingConfiguration | null>;
  findAllBySociety(societyId: string): Promise<FinancingConfiguration[]>;
  upsertForProduct(productId: string, societyId: string, data: Partial<FinancingConfiguration>): Promise<FinancingConfiguration>;
  deleteForProduct(productId: string): Promise<void>;
}

export const FINANCING_CONFIG_REPOSITORY = 'IFinancingConfigRepository';
