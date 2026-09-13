import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancingConfiguration } from '../entities/financing-configuration.entity';
import { IFinancingConfigRepository } from '../interfaces/financing-config-repository.interface';
import { CreateFinancingConfigDto } from '../dto/create-financing-config.dto';
import { UpdateFinancingConfigDto } from '../dto/update-financing-config.dto';

/**
 * FinancingConfigRepository
 *
 * Acceso a datos para FinancingConfiguration con garantía de aislamiento por societyId.
 * Todos los métodos validan que la operación pertenece a la sociedad especificada.
 */
@Injectable()
export class FinancingConfigRepository implements IFinancingConfigRepository {
  constructor(
    @InjectRepository(FinancingConfiguration)
    private readonly repo: Repository<FinancingConfiguration>,
  ) {}

  /**
   * Crea una nueva configuración de financiación.
   *
   * @param societyId - ID de la sociedad (del usuario autenticado)
   * @param dto - Datos: name, financingRate, isGlobal, productIds
   * @returns FinancingConfiguration creada
   */
  async create(
    societyId: string,
    dto: CreateFinancingConfigDto,
  ): Promise<FinancingConfiguration> {
    const config = this.repo.create({
      societyId,
      name: dto.name,
      financingRate: dto.financingRate,
      isGlobal: dto.isGlobal ?? true,
      isActive: true,
    });

    const saved = await this.repo.save(config);

    // Cargar relaciones M2M si se proporcionan productIds
    if (dto.productIds && dto.productIds.length > 0) {
      await this.repo
        .createQueryBuilder()
        .relation(FinancingConfiguration, 'products')
        .of(saved)
        .add(dto.productIds);
    }

    return this.repo.findOneOrFail({
      where: { financingConfigId: saved.financingConfigId },
      relations: ['products'],
    });
  }

  /**
   * Obtiene todas las configuraciones de una sociedad.
   *
   * @param societyId - ID de la sociedad
   * @returns Array de FinancingConfiguration
   */
  async findAllBySociety(societyId: string): Promise<FinancingConfiguration[]> {
    return this.repo.find({
      where: { societyId },
      relations: ['products'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene una configuración por ID y societyId.
   * Garantiza que pertenezca a la sociedad especificada.
   *
   * @param societyId - ID de la sociedad
   * @param financingConfigId - ID de la configuración
   * @returns FinancingConfiguration o null
   */
  async findById(
    societyId: string,
    financingConfigId: string,
  ): Promise<FinancingConfiguration | null> {
    return this.repo.findOne({
      where: { societyId, financingConfigId },
      relations: ['products'],
    });
  }

  /**
   * Actualiza una configuración de financiación.
   *
   * @param societyId - ID de la sociedad
   * @param financingConfigId - ID de la configuración
   * @param dto - Campos a actualizar: name, financingRate, isActive
   * @returns FinancingConfiguration actualizada
   */
  async update(
    societyId: string,
    financingConfigId: string,
    dto: UpdateFinancingConfigDto,
  ): Promise<FinancingConfiguration> {
    await this.repo.update(
      { societyId, financingConfigId },
      {
        name: dto.name,
        financingRate: dto.financingRate,
        isActive: dto.isActive,
      },
    );

    return this.repo.findOneOrFail({
      where: { societyId, financingConfigId },
      relations: ['products'],
    });
  }

  /**
   * Elimina una configuración de financiación.
   * Debe verificarse que no haya planes vinculados antes de llamar este método.
   *
   * @param societyId - ID de la sociedad
   * @param financingConfigId - ID de la configuración
   */
  async delete(societyId: string, financingConfigId: string): Promise<void> {
    await this.repo.delete({ societyId, financingConfigId });
  }
}
