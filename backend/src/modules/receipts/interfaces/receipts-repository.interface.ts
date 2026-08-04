import { Receipt } from '../entities/receipt.entity';

export interface IReceiptsRepository {
  create(data: Partial<Receipt>): Promise<Receipt>;
  findById(id: string): Promise<Receipt | null>;
  findBySociety(societyId: string): Promise<Receipt[]>;
  findLastNumberForSociety(societyId: string): Promise<number>;
}

export const RECEIPTS_REPOSITORY = 'IReceiptsRepository';
