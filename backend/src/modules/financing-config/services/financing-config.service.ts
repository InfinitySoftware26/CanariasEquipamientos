import { Injectable, Inject } from '@nestjs/common';
import { IFinancingConfigRepository, FINANCING_CONFIG_REPOSITORY } from '../interfaces/financing-config-repository.interface';
import { UpdateFinancingConfigDto } from '../dto/update-financing-config.dto';
import { FinancingConfiguration } from '../entities/financing-configuration.entity';

const DEFAULTS = {
  installments3Rate: 0.15,
  installments6Rate: 0.25,
  installments9Rate: 0.35,
};

@Injectable()
export class FinancingConfigService {
  constructor(
    @Inject(FINANCING_CONFIG_REPOSITORY)
    private readonly repo: IFinancingConfigRepository,
  ) {}

  async getConfig(societyId: string): Promise<FinancingConfiguration> {
    const config = await this.repo.findBySociety(societyId);
    if (!config) return this.repo.upsert(societyId, DEFAULTS);
    return config;
  }

  updateConfig(societyId: string, dto: UpdateFinancingConfigDto): Promise<FinancingConfiguration> {
    return this.repo.upsert(societyId, dto);
  }

  async getRateForInstallments(societyId: string, count: number): Promise<number> {
    const config = await this.getConfig(societyId);
    if (count === 3) return Number(config.installments3Rate);
    if (count === 6) return Number(config.installments6Rate);
    return Number(config.installments9Rate);
  }
}
