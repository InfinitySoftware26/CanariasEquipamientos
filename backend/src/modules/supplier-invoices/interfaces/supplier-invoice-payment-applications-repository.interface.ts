import { SupplierInvoicePaymentApplication } from '../entities/supplier-invoice-payment-application.entity';

export interface ISupplierInvoicePaymentApplicationsRepository {
  create(data: Partial<SupplierInvoicePaymentApplication>): Promise<SupplierInvoicePaymentApplication>;
  findByInvoice(supplierInvoiceId: string): Promise<SupplierInvoicePaymentApplication[]>;
  findByPayment(supplierPaymentId: string): Promise<SupplierInvoicePaymentApplication[]>;
  sumByInvoice(supplierInvoiceId: string): Promise<number>;
  sumByPayment(supplierPaymentId: string): Promise<number>;
}

export const SUPPLIER_INVOICE_PAYMENT_APPLICATIONS_REPOSITORY = 'ISupplierInvoicePaymentApplicationsRepository';
