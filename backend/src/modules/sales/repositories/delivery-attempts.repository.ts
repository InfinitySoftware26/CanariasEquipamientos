import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryAttempt } from '../entities/delivery-attempt.entity';
import { IDeliveryAttemptsRepository } from '../interfaces/delivery-attempts-repository.interface';

@Injectable()
export class DeliveryAttemptsRepository implements IDeliveryAttemptsRepository {
  constructor(@InjectRepository(DeliveryAttempt) private readonly repo: Repository<DeliveryAttempt>) {}

  async create(data: {
    saleId: string;
    staffId: string;
    attemptNumber: number;
    reason: string;
    attemptedAt: Date;
  }): Promise<DeliveryAttempt> {
    return this.repo.save(this.repo.create(data));
  }

  findBySale(saleId: string): Promise<DeliveryAttempt[]> {
    return this.repo.find({ where: { saleId }, order: { attemptNumber: 'ASC' } });
  }

  countBySale(saleId: string): Promise<number> {
    return this.repo.count({ where: { saleId } });
  }
}
