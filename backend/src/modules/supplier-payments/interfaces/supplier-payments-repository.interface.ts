import { SupplierPayment } from '../entities/supplier-payment.entity';

export interface ISupplierPaymentsRepository {
  create(data: Partial<SupplierPayment>): Promise<SupplierPayment>;
  findById(id: string): Promise<SupplierPayment | null>;
  findBySupplier(supplierId: string): Promise<SupplierPayment[]>;
  findBySociety(societyId: string, from?: string, to?: string): Promise<SupplierPayment[]>;
  sumBySupplier(supplierId: string): Promise<number>;
}

export const SUPPLIER_PAYMENTS_REPOSITORY = 'ISupplierPaymentsRepository';
