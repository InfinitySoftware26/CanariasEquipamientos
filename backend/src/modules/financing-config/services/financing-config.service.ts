import { Injectable, Inject } from '@nestjs/common';
import { IFinancingConfigRepository, FINANCING_CONFIG_REPOSITORY } from '../interfaces/financing-config-repository.interface';
import { UpdateFinancingConfigDto } from '../dto/update-financing-config.dto';
import { UpsertProductFinancingConfigDto } from '../dto/upsert-product-financing-config.dto';
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

  /**
   * Resuelve la configuración financiera aplicable: prioriza el override
   * específico del producto (si existe y está activo) y cae al global de la
   * sociedad en caso contrario (docs/Data-Base/Entities.md — Prioridad de Resolución).
   */
  async getConfigForProduct(societyId: string, productId: string): Promise<FinancingConfiguration> {
    const productConfig = await this.repo.findByProduct(productId);
    if (productConfig) return productConfig;
    return this.getConfig(societyId);
  }

  async getRateForInstallments(societyId: string, count: number): Promise<number> {
    const config = await this.getConfig(societyId);
    if (count === 3) return Number(config.installments3Rate);
    if (count === 6) return Number(config.installments6Rate);
    return Number(config.installments9Rate);
  }

  listProductOverrides(societyId: string): Promise<FinancingConfiguration[]> {
    return this.repo
      .findAllBySociety(societyId)
      .then(configs => configs.filter(c => !!c.productId));
  }

  upsertProductOverride(
    productId: string,
    societyId: string,
    dto: UpsertProductFinancingConfigDto,
  ): Promise<FinancingConfiguration> {
    return this.repo.upsertForProduct(productId, societyId, dto);
  }

  deleteProductOverride(productId: string): Promise<void> {
    return this.repo.deleteForProduct(productId);
  }
}
