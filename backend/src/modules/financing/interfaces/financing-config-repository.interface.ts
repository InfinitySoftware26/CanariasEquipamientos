import { FinancingConfiguration } from '../entities/financing-configuration.entity';
import { CreateFinancingConfigDto } from '../dto/create-financing-config.dto';
import { UpdateFinancingConfigDto } from '../dto/update-financing-config.dto';
export interface IFinancingConfigRepository {
  create(
    societyId: string,
    dto: CreateFinancingConfigDto,
  ): Promise<FinancingConfiguration>;

  findAllBySociety(societyId: string): Promise<FinancingConfiguration[]>;
  findById(
    societyId: string,
    financingConfigId: string,
  ): Promise<FinancingConfiguration | null>;

  update(
    societyId: string,
    financingConfigId: string,
    dto: UpdateFinancingConfigDto,
  ): Promise<FinancingConfiguration>;

  delete(societyId: string, financingConfigId: string): Promise<void>;
}

export const FINANCING_CONFIG_REPOSITORY = 'IFinancingConfigRepository';
