import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settlement } from '../entities/settlement.entity';
import { ISettlementsRepository, SettlementFilters } from '../interfaces/settlements-repository.interface';
import { SettlementStatus } from '../../../common/enums/settlement-status.enum';

@Injectable()
export class SettlementsRepository implements ISettlementsRepository {
  constructor(
    @InjectRepository(Settlement) private readonly repo: Repository<Settlement>,
  ) {}

  findBySociety(societyId: string, filters?: SettlementFilters): Promise<Settlement[]> {
    return this.repo.find({
      where: {
        societyId,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.staffId ? { staffId: filters.staffId } : {}),
      },
      order: { settlementDate: 'DESC' },
    });
  }

  findById(id: string): Promise<Settlement | null> {
    return this.repo.findOne({ where: { settlementId: id } });
  }

  findByClosure(closureId: string): Promise<Settlement | null> {
    return this.repo.findOne({ where: { closureId } });
  }

  async create(data: Partial<Settlement>): Promise<Settlement> {
    return this.repo.save(this.repo.create(data));
  }

  async updateStatus(id: string, status: SettlementStatus): Promise<void> {
    await this.repo.update({ settlementId: id }, { status });
  }
}
