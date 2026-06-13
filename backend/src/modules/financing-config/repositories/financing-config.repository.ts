import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancingConfiguration } from '../entities/financing-configuration.entity';
import { IFinancingConfigRepository } from '../interfaces/financing-config-repository.interface';

@Injectable()
export class FinancingConfigRepository implements IFinancingConfigRepository {
  constructor(
    @InjectRepository(FinancingConfiguration)
    private readonly repo: Repository<FinancingConfiguration>,
  ) {}

  findBySociety(societyId: string): Promise<FinancingConfiguration | null> {
    return this.repo.findOne({ where: { societyId, isActive: true } });
  }

  async upsert(societyId: string, data: Partial<FinancingConfiguration>): Promise<FinancingConfiguration> {
    const existing = await this.repo.findOne({ where: { societyId } });
    if (existing) {
      await this.repo.update({ financingConfigId: existing.financingConfigId }, data);
      return this.repo.findOneOrFail({ where: { financingConfigId: existing.financingConfigId } });
    }
    return this.repo.save(this.repo.create({ ...data, societyId }));
  }
}
