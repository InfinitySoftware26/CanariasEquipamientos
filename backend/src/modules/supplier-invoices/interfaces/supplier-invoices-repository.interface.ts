import { SupplierInvoice } from '../entities/supplier-invoice.entity';
import { SupplierInvoiceStatus } from '../../../common/enums/supplier-invoice-status.enum';

export interface SupplierInvoiceFilters {
  supplierId?: string;
  status?: SupplierInvoiceStatus;
  from?: string;
  to?: string;
}

export interface ISupplierInvoicesRepository {
  create(data: Partial<SupplierInvoice>): Promise<SupplierInvoice>;
  findById(id: string): Promise<SupplierInvoice | null>;
  findBySociety(societyId: string, filters?: SupplierInvoiceFilters): Promise<SupplierInvoice[]>;
  findBySupplier(supplierId: string): Promise<SupplierInvoice[]>;
  update(id: string, data: Partial<SupplierInvoice>): Promise<void>;
  sumDebtBySupplier(supplierId: string): Promise<{ totalInvoiced: number; totalPaid: number }>;
}

export const SUPPLIER_INVOICES_REPOSITORY = 'ISupplierInvoicesRepository';
