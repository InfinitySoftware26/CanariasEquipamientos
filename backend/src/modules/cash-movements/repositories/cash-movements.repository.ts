import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashMovement } from '../entities/cash-movement.entity';
import { ICashMovementsRepository } from '../interfaces/cash-movements-repository.interface';

@Injectable()
export class CashMovementsRepository implements ICashMovementsRepository {
  constructor(@InjectRepository(CashMovement) private readonly repo: Repository<CashMovement>) {}

  async create(data: Partial<CashMovement>): Promise<CashMovement> {
    return this.repo.save(this.repo.create(data));
  }

  findByCashbox(cashboxId: string): Promise<CashMovement[]> {
    return this.repo.find({ where: { cashboxId }, order: { createdAt: 'ASC' } });
  }

  findBySociety(societyId: string, from?: string, to?: string): Promise<CashMovement[]> {
    const qb = this.repo.createQueryBuilder('m').where('m.society_id = :societyId', { societyId });
    if (from) qb.andWhere('m.created_at >= :from', { from });
    if (to) qb.andWhere('m.created_at <= :to', { to });
    return qb.orderBy('m.created_at', 'DESC').getMany();
  }
}
