import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import {
    IFinancingConfigRepository,
    FINANCING_CONFIG_REPOSITORY,
} from '../interfaces/financing-config-repository.interface';
import {
    IFinancingPlanRepository,
    FINANCING_PLAN_REPOSITORY,
} from '../interfaces/financing-plan-repository.interface';
import {
    IPromotionRepository,
    PROMOTION_REPOSITORY,
} from '../interfaces/promotion-repository.interface';
import { CreateFinancingConfigDto } from '../dto/create-financing-config.dto';
import { UpdateFinancingConfigDto } from '../dto/update-financing-config.dto';
import { CreateFinancingPlanDto } from '../dto/create-financing-plan.dto';
import { UpdateFinancingPlanDto } from '../dto/update-financing-plan.dto';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
import { FinancingConfiguration } from '../entities/financing-configuration.entity';
import { FinancingPlan } from '../entities/financing-plan.entity';
import { Promotion } from '../entities/promotion.entity';

/**
 * FinancingService
 *
 * Servicio único que gestiona las 3 entidades del módulo de financiación:
 * - FinancingConfiguration: tasa base de financiación (global o por producto)
 * - FinancingPlan: esquemas de cuotas + frecuencia de pago (vinculados a una configuración)
 * - Promotion: ganancias adicionales / descuentos especiales (vinculadas o no a un plan)
 *
 * Todos los métodos validan societyId (seguridad multi-sociedad).
 *
 * Ejemplo de flujo:
 *   1. Admin crea FinancingConfiguration "Estándar" (12% tasa global)
 *   2. Admin crea FinancingPlan "3 cuotas mensuales" vinculado a esa config
 *   3. Admin crea Promotion "+5% en 6 cuotas" vinculada a ese plan
 */
@Injectable()
export class FinancingService {
    constructor(
        @Inject(FINANCING_CONFIG_REPOSITORY)
        private readonly configRepo: IFinancingConfigRepository,
        @Inject(FINANCING_PLAN_REPOSITORY)
        private readonly planRepo: IFinancingPlanRepository,
        @Inject(PROMOTION_REPOSITORY)
        private readonly promotionRepo: IPromotionRepository,
    ) { }
    /**
     * Convierte una violación de FK de Postgres (23503) en un error de negocio claro.
     * Cualquier otro error se relanza tal cual.
     */
    private async runDelete(operation: () => Promise<void>, dependencyMessage: string): Promise<void> {
        try {
            await operation();
        } catch (error) {
            const isForeignKeyViolation =
                error instanceof QueryFailedError &&
                (error as unknown as { code?: string }).code === '23503';

            if (isForeignKeyViolation) {
                throw new BadRequestException(dependencyMessage);
            }

            throw error;
        }
    }
    // ─── FINANCING CONFIGURATION ──────────────────────────────────────────────

    async createConfig(
        societyId: string,
        dto: CreateFinancingConfigDto,
    ): Promise<FinancingConfiguration> {
        if (!dto.isGlobal && (!dto.productIds || dto.productIds.length === 0)) {
            throw new BadRequestException(
                'Si isGlobal es false, debes proporcionar al menos un productId.',
            );
        }

        return this.configRepo.create(societyId, dto);
    }

    async findAllConfigs(societyId: string): Promise<FinancingConfiguration[]> {
        return this.configRepo.findAllBySociety(societyId);
    }

    async findOneConfig(
        societyId: string,
        financingConfigId: string,
    ): Promise<FinancingConfiguration> {
        const config = await this.configRepo.findById(societyId, financingConfigId);
        if (!config) {
            throw new NotFoundException(
                'Configuración de financiación no encontrada o no tiene acceso.',
            );
        }
        return config;
    }

    async updateConfig(
        societyId: string,
        financingConfigId: string,
        dto: UpdateFinancingConfigDto,
    ): Promise<FinancingConfiguration> {
        await this.findOneConfig(societyId, financingConfigId);
        return this.configRepo.update(societyId, financingConfigId, dto);
    }

    async deleteConfig(societyId: string, financingConfigId: string): Promise<void> {
        await this.findOneConfig(societyId, financingConfigId);
        await this.runDelete(
            () => this.configRepo.delete(societyId, financingConfigId),
            'No se puede eliminar: esta configuración tiene planes de financiación vinculados.',
        );
    }

    // ─── FINANCING PLAN ────────────────────────────────────────────────────────

    async createPlan(
        societyId: string,
        dto: CreateFinancingPlanDto,
    ): Promise<FinancingPlan> {
        // Garantiza que la configuración vinculada exista y pertenezca a la sociedad
        await this.findOneConfig(societyId, dto.financingConfigId);

        if (!dto.isGlobal && (!dto.productIds || dto.productIds.length === 0)) {
            throw new BadRequestException(
                'Si isGlobal es false, debes proporcionar al menos un productId.',
            );
        }

        return this.planRepo.create(societyId, dto);
    }

    async findAllPlans(societyId: string): Promise<FinancingPlan[]> {
        return this.planRepo.findAllBySociety(societyId);
    }

    async findOnePlan(
        societyId: string,
        financingPlanId: string,
    ): Promise<FinancingPlan> {
        const plan = await this.planRepo.findById(societyId, financingPlanId);
        if (!plan) {
            throw new NotFoundException(
                'Plan de financiación no encontrado o no tiene acceso.',
            );
        }
        return plan;
    }

    async updatePlan(
        societyId: string,
        financingPlanId: string,
        dto: UpdateFinancingPlanDto,
    ): Promise<FinancingPlan> {
        await this.findOnePlan(societyId, financingPlanId);

        if (dto.financingConfigId) {
            await this.findOneConfig(societyId, dto.financingConfigId);
        }

        return this.planRepo.update(societyId, financingPlanId, dto);
    }

    async deletePlan(societyId: string, financingPlanId: string): Promise<void> {
        await this.findOnePlan(societyId, financingPlanId);
        await this.runDelete(
            () => this.planRepo.delete(societyId, financingPlanId),
            'No se puede eliminar: este plan tiene promociones o ventas vinculadas.',
        );
    }

    // ─── PROMOTION ─────────────────────────────────────────────────────────────

    async createPromotion(
        societyId: string,
        dto: CreatePromotionDto,
    ): Promise<Promotion> {
        if (dto.financingPlanId) {
            await this.findOnePlan(societyId, dto.financingPlanId);
        }

        if (!dto.financingPlanId && !dto.isGlobal && (!dto.productIds || dto.productIds.length === 0)) {
            throw new BadRequestException(
                'Si isGlobal es false, debes proporcionar al menos un productId.',
            );
        }

        return this.promotionRepo.create(societyId, dto);
    }

    async findAllPromotions(societyId: string): Promise<Promotion[]> {
        return this.promotionRepo.findAllBySociety(societyId);
    }

    async findOnePromotion(
        societyId: string,
        promotionId: string,
    ): Promise<Promotion> {
        const promotion = await this.promotionRepo.findById(societyId, promotionId);
        if (!promotion) {
            throw new NotFoundException(
                'Promoción no encontrada o no tiene acceso.',
            );
        }
        return promotion;
    }

    async updatePromotion(
        societyId: string,
        promotionId: string,
        dto: UpdatePromotionDto,
    ): Promise<Promotion> {
        await this.findOnePromotion(societyId, promotionId);

        if (dto.financingPlanId) {
            await this.findOnePlan(societyId, dto.financingPlanId);
        }

        return this.promotionRepo.update(societyId, promotionId, dto);
    }

    async deletePromotion(societyId: string, promotionId: string): Promise<void> {
        await this.findOnePromotion(societyId, promotionId);
        await this.runDelete(
            () => this.promotionRepo.delete(societyId, promotionId),
            'No se puede eliminar: esta promoción tiene ventas vinculadas.',
        );
    }
}
