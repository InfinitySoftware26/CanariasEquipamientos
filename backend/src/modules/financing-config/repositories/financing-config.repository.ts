import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { FinancingConfiguration } from '../entities/financing-configuration.entity';
import { IFinancingConfigRepository } from '../interfaces/financing-config-repository.interface';

@Injectable()
export class FinancingConfigRepository implements IFinancingConfigRepository {
  constructor(
    @InjectRepository(FinancingConfiguration)
    private readonly repo: Repository<FinancingConfiguration>,
  ) {}

  findBySociety(societyId: string): Promise<FinancingConfiguration | null> {
    return this.repo.findOne({ where: { societyId, isActive: true, productId: IsNull() } });
  }

  async upsert(societyId: string, data: Partial<FinancingConfiguration>): Promise<FinancingConfiguration> {
    const existing = await this.repo.findOne({ where: { societyId, productId: IsNull() } });
    if (existing) {
      await this.repo.update({ financingConfigId: existing.financingConfigId }, data);
      return this.repo.findOneOrFail({ where: { financingConfigId: existing.financingConfigId } });
    }
    return this.repo.save(this.repo.create({ ...data, societyId, isGlobal: true }));
  }

  findByProduct(productId: string): Promise<FinancingConfiguration | null> {
    return this.repo.findOne({ where: { productId, isActive: true } });
  }

  findAllBySociety(societyId: string): Promise<FinancingConfiguration[]> {
    return this.repo.find({ where: { societyId } });
  }

  async upsertForProduct(
    productId: string,
    societyId: string,
    data: Partial<FinancingConfiguration>,
  ): Promise<FinancingConfiguration> {
    const existing = await this.repo.findOne({ where: { productId } });
    if (existing) {
      await this.repo.update({ financingConfigId: existing.financingConfigId }, data);
      return this.repo.findOneOrFail({ where: { financingConfigId: existing.financingConfigId } });
    }
    return this.repo.save(this.repo.create({ ...data, productId, societyId, isGlobal: false }));
  }

  async deleteForProduct(productId: string): Promise<void> {
    await this.repo.delete({ productId });
  }
}
