import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleHistory } from '../entities/sale-history.entity';
import { ISaleHistoryRepository } from '../interfaces/sale-history-repository.interface';

@Injectable()
export class SaleHistoryRepository implements ISaleHistoryRepository {
  constructor(@InjectRepository(SaleHistory) private readonly repo: Repository<SaleHistory>) {}

  async create(data: {
    saleId: string;
    action: string;
    snapshot: object;
    performedBy: string;
    performedByName: string;
  }): Promise<SaleHistory> {
    return this.repo.save(this.repo.create(data));
  }

  findBySale(saleId: string): Promise<SaleHistory[]> {
    return this.repo.find({ where: { saleId }, order: { performedAt: 'ASC' } });
  }
}
