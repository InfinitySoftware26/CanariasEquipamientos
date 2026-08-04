import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { IPaymentsRepository, PaymentFilters } from '../interfaces/payments-repository.interface';

@Injectable()
export class PaymentsRepository implements IPaymentsRepository {
  constructor(@InjectRepository(Payment) private readonly repo: Repository<Payment>) {}

  async create(data: Partial<Payment>): Promise<Payment> {
    return this.repo.save(this.repo.create(data));
  }

  findById(id: string): Promise<Payment | null> {
    return this.repo.findOne({ where: { paymentId: id } });
  }

  findBySale(saleId: string): Promise<Payment[]> {
    return this.repo.find({ where: { saleId }, order: { paymentDate: 'DESC' } });
  }

  findBySociety(societyId: string, filters?: PaymentFilters): Promise<Payment[]> {
    const qb = this.repo.createQueryBuilder('payment').where('payment.society_id = :societyId', { societyId });

    if (filters?.saleId) qb.andWhere('payment.sale_id = :saleId', { saleId: filters.saleId });
    if (filters?.clientId) qb.andWhere('payment.client_id = :clientId', { clientId: filters.clientId });
    if (filters?.staffId) qb.andWhere('payment.staff_id = :staffId', { staffId: filters.staffId });
    if (filters?.from) qb.andWhere('payment.payment_date >= :from', { from: filters.from });
    if (filters?.to) qb.andWhere('payment.payment_date <= :to', { to: filters.to });

    return qb.orderBy('payment.payment_date', 'DESC').getMany();
  }

  findByStaffAndDateRange(staffId: string, from: Date, to: Date): Promise<Payment[]> {
    return this.repo.find({
      where: { staffId, paymentDate: Between(from, to) },
      order: { paymentDate: 'ASC' },
    });
  }
}
