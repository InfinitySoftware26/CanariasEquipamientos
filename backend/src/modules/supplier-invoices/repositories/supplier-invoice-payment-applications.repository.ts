import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierInvoicePaymentApplication } from '../entities/supplier-invoice-payment-application.entity';
import { ISupplierInvoicePaymentApplicationsRepository } from '../interfaces/supplier-invoice-payment-applications-repository.interface';

@Injectable()
export class SupplierInvoicePaymentApplicationsRepository implements ISupplierInvoicePaymentApplicationsRepository {
  constructor(
    @InjectRepository(SupplierInvoicePaymentApplication)
    private readonly repo: Repository<SupplierInvoicePaymentApplication>,
  ) {}

  async create(data: Partial<SupplierInvoicePaymentApplication>): Promise<SupplierInvoicePaymentApplication> {
    return this.repo.save(this.repo.create(data));
  }

  findByInvoice(supplierInvoiceId: string): Promise<SupplierInvoicePaymentApplication[]> {
    return this.repo.find({ where: { supplierInvoiceId }, order: { createdAt: 'DESC' } });
  }

  findByPayment(supplierPaymentId: string): Promise<SupplierInvoicePaymentApplication[]> {
    return this.repo.find({ where: { supplierPaymentId }, order: { createdAt: 'DESC' } });
  }

  async sumByInvoice(supplierInvoiceId: string): Promise<number> {
    const raw = await this.repo
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.applied_amount), 0)', 'sum')
      .where('a.supplier_invoice_id = :supplierInvoiceId', { supplierInvoiceId })
      .getRawOne<{ sum: string }>();
    return Number(raw?.sum ?? 0);
  }

  async sumByPayment(supplierPaymentId: string): Promise<number> {
    const raw = await this.repo
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.applied_amount), 0)', 'sum')
      .where('a.supplier_payment_id = :supplierPaymentId', { supplierPaymentId })
      .getRawOne<{ sum: string }>();
    return Number(raw?.sum ?? 0);
  }
}
