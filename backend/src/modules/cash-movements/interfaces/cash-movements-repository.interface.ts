import { CashMovement } from '../entities/cash-movement.entity';

export interface ICashMovementsRepository {
  create(data: Partial<CashMovement>): Promise<CashMovement>;
  findByCashbox(cashboxId: string): Promise<CashMovement[]>;
  findBySociety(societyId: string, from?: string, to?: string): Promise<CashMovement[]>;
}

export const CASH_MOVEMENTS_REPOSITORY = 'ICashMovementsRepository';
