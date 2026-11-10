import { Receipt } from '../entities/receipt.entity';

export interface IReceiptsRepository {
  create(data: Partial<Receipt>): Promise<Receipt>;
  /** societyId opcional: si se pasa, filtra por sociedad en la consulta. */
  findById(id: string, societyId?: string): Promise<Receipt | null>;
  findBySociety(societyId: string): Promise<Receipt[]>;
  findLastNumberForSociety(societyId: string): Promise<number>;
}

export const RECEIPTS_REPOSITORY = 'IReceiptsRepository';
