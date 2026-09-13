import { FinancingConfiguration } from '../entities/financing-configuration.entity';
import { CreateFinancingConfigDto } from '../dto/create-financing-config.dto';
import { UpdateFinancingConfigDto } from '../dto/update-financing-config.dto';

/**
 * IFinancingConfigRepository
 *
 * Define las operaciones de acceso a datos para FinancingConfiguration.
 * Todos los métodos requieren y validan societyId para garantizar aislamiento multi-sociedad.
 */
export interface IFinancingConfigRepository {
  /**
   * Crea una nueva configuración de financiación.
   */
  create(
    societyId: string,
    dto: CreateFinancingConfigDto,
  ): Promise<FinancingConfiguration>;

  /**
   * Obtiene todas las configuraciones de una sociedad.
   */
  findAllBySociety(societyId: string): Promise<FinancingConfiguration[]>;

  /**
   * Obtiene una configuración por ID, validando que pertenezca a la sociedad.
   */
  findById(
    societyId: string,
    financingConfigId: string,
  ): Promise<FinancingConfiguration | null>;

  /**
   * Actualiza una configuración existente.
   */
  update(
    societyId: string,
    financingConfigId: string,
    dto: UpdateFinancingConfigDto,
  ): Promise<FinancingConfiguration>;

  /**
   * Elimina una configuración.
   */
  delete(societyId: string, financingConfigId: string): Promise<void>;
}

export const FINANCING_CONFIG_REPOSITORY = 'IFinancingConfigRepository';
