import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentInstallmentApplication } from '../entities/payment-installment-application.entity';
import { IPaymentInstallmentApplicationsRepository } from '../interfaces/payment-installment-applications-repository.interface';

@Injectable()
export class PaymentInstallmentApplicationsRepository implements IPaymentInstallmentApplicationsRepository {
  constructor(
    @InjectRepository(PaymentInstallmentApplication)
    private readonly repo: Repository<PaymentInstallmentApplication>,
  ) {}

  async create(data: Partial<PaymentInstallmentApplication>): Promise<PaymentInstallmentApplication> {
    return this.repo.save(this.repo.create(data));
  }

  findByPayment(paymentId: string): Promise<PaymentInstallmentApplication[]> {
    return this.repo.find({ where: { paymentId } });
  }

  findByInstallment(installmentId: string): Promise<PaymentInstallmentApplication[]> {
    return this.repo.find({ where: { installmentId } });
  }

  async sumByPayment(paymentId: string): Promise<number> {
    const raw = await this.repo
      .createQueryBuilder('app')
      .select('COALESCE(SUM(app.applied_amount), 0)', 'sum')
      .where('app.payment_id = :paymentId', { paymentId })
      .getRawOne<{ sum: string }>();
    return Number(raw?.sum ?? 0);
  }
}
