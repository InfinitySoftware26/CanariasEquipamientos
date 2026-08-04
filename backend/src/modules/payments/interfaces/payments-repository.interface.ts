import { Payment } from '../entities/payment.entity';

export interface PaymentFilters {
  saleId?: string;
  clientId?: string;
  staffId?: string;
  from?: string;
  to?: string;
}

export interface IPaymentsRepository {
  create(data: Partial<Payment>): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findBySale(saleId: string): Promise<Payment[]>;
  findBySociety(societyId: string, filters?: PaymentFilters): Promise<Payment[]>;
  findByStaffAndDateRange(staffId: string, from: Date, to: Date): Promise<Payment[]>;
}

export const PAYMENTS_REPOSITORY = 'IPaymentsRepository';
