import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierPayment } from '../entities/supplier-payment.entity';
import { ISupplierPaymentsRepository } from '../interfaces/supplier-payments-repository.interface';

@Injectable()
export class SupplierPaymentsRepository implements ISupplierPaymentsRepository {
  constructor(@InjectRepository(SupplierPayment) private readonly repo: Repository<SupplierPayment>) {}

  async create(data: Partial<SupplierPayment>): Promise<SupplierPayment> {
    return this.repo.save(this.repo.create(data));
  }

  findById(id: string): Promise<SupplierPayment | null> {
    return this.repo.findOne({ where: { supplierPaymentId: id } });
  }

  findBySupplier(supplierId: string): Promise<SupplierPayment[]> {
    return this.repo.find({ where: { supplierId }, order: { paymentDate: 'DESC' } });
  }

  findBySociety(societyId: string, from?: string, to?: string): Promise<SupplierPayment[]> {
    const qb = this.repo.createQueryBuilder('sp').where('sp.society_id = :societyId', { societyId });
    if (from) qb.andWhere('sp.payment_date >= :from', { from });
    if (to) qb.andWhere('sp.payment_date <= :to', { to });
    return qb.orderBy('sp.payment_date', 'DESC').getMany();
  }

  async sumBySupplier(supplierId: string): Promise<number> {
    const raw = await this.repo
      .createQueryBuilder('sp')
      .select('COALESCE(SUM(sp.amount), 0)', 'sum')
      .where('sp.supplier_id = :supplierId', { supplierId })
      .getRawOne<{ sum: string }>();
    return Number(raw?.sum ?? 0);
  }
}
