import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierInvoice } from '../entities/supplier-invoice.entity';
import {
  ISupplierInvoicesRepository, SupplierInvoiceFilters,
} from '../interfaces/supplier-invoices-repository.interface';

@Injectable()
export class SupplierInvoicesRepository implements ISupplierInvoicesRepository {
  constructor(@InjectRepository(SupplierInvoice) private readonly repo: Repository<SupplierInvoice>) {}

  async create(data: Partial<SupplierInvoice>): Promise<SupplierInvoice> {
    return this.repo.save(this.repo.create(data));
  }

  findById(id: string): Promise<SupplierInvoice | null> {
    return this.repo.findOne({ where: { supplierInvoiceId: id } });
  }

  findBySociety(societyId: string, filters?: SupplierInvoiceFilters): Promise<SupplierInvoice[]> {
    const qb = this.repo.createQueryBuilder('si').where('si.society_id = :societyId', { societyId });
    if (filters?.supplierId) qb.andWhere('si.supplier_id = :supplierId', { supplierId: filters.supplierId });
    if (filters?.status) qb.andWhere('si.status = :status', { status: filters.status });
    if (filters?.from) qb.andWhere('si.issue_date >= :from', { from: filters.from });
    if (filters?.to) qb.andWhere('si.issue_date <= :to', { to: filters.to });
    return qb.orderBy('si.issue_date', 'DESC').getMany();
  }

  findBySupplier(supplierId: string): Promise<SupplierInvoice[]> {
    return this.repo.find({ where: { supplierId }, order: { issueDate: 'DESC' } });
  }

  async update(id: string, data: Partial<SupplierInvoice>): Promise<void> {
    await this.repo.update({ supplierInvoiceId: id }, data);
  }

  async sumDebtBySupplier(supplierId: string): Promise<{ totalInvoiced: number; totalPaid: number }> {
    const raw = await this.repo.manager.query(
      `SELECT
         COALESCE(SUM(si.total_amount), 0) AS total_invoiced,
         COALESCE(SUM(apps.applied), 0) AS total_paid
       FROM "SUPPLIER_INVOICES" si
       LEFT JOIN (
         SELECT supplier_invoice_id, SUM(applied_amount) AS applied
         FROM "SUPPLIER_INVOICE_PAYMENT_APPLICATIONS"
         GROUP BY supplier_invoice_id
       ) apps ON apps.supplier_invoice_id = si.supplier_invoice_id
       WHERE si.supplier_id = $1 AND si.status != 'cancelled'`,
      [supplierId],
    );
    return {
      totalInvoiced: Number(raw[0]?.total_invoiced ?? 0),
      totalPaid: Number(raw[0]?.total_paid ?? 0),
    };
  }
}
