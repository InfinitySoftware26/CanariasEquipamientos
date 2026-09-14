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
    async createConfig(
        societyId: string,
        dto: CreateFinancingConfigDto,
    ): Promise<FinancingConfiguration> {
        if (!dto.isGlobal && (!dto.productIds || dto.productIds.length === 0)) {
            throw new BadRequestException(
                'Si isGlobal es false, debes proporcionar al menos un productId.',
            );
        }

        console.log('Creando configuración de financiación', { societyId, name: dto.name });
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
        console.log('Actualizando configuración de financiación', { societyId, financingConfigId });
        return this.configRepo.update(societyId, financingConfigId, dto);
    }

    async deleteConfig(societyId: string, financingConfigId: string): Promise<void> {
        await this.findOneConfig(societyId, financingConfigId);
        console.log('Eliminando configuración de financiación', { societyId, financingConfigId });
        await this.runDelete(
            () => this.configRepo.delete(societyId, financingConfigId),
            'No se puede eliminar: esta configuración tiene planes de financiación vinculados.',
        );
    }

    async createPlan(
        societyId: string,
        dto: CreateFinancingPlanDto,
    ): Promise<FinancingPlan> {
        const hasConfig = Boolean(dto.financingConfigId);
        const hasDirectRate = dto.financingRate !== undefined && dto.financingRate !== null;

        if ((hasConfig && hasDirectRate) || (!hasConfig && !hasDirectRate)) {
            throw new BadRequestException(
                'Debes seleccionar una configuración de financiación O ingresar un porcentaje de financiación directo, no ambos.',
            );
        }

        if (hasConfig && dto.financingConfigId) {
            await this.findOneConfig(societyId, dto.financingConfigId);
        }

        if (!dto.isGlobal && (!dto.productIds || dto.productIds.length === 0)) {
            throw new BadRequestException(
                'Si isGlobal es false, debes proporcionar al menos un productId.',
            );
        }

        console.log('Creando plan de financiación', { societyId, name: dto.name });
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
        const currentPlan = await this.findOnePlan(societyId, financingPlanId);

        const targetConfig = dto.financingConfigId !== undefined ? dto.financingConfigId : currentPlan.financingConfigId;
        const targetRate = dto.financingRate !== undefined ? dto.financingRate : currentPlan.financingRate;

        if (targetConfig && targetRate !== null && targetRate !== undefined) {
            throw new BadRequestException(
                'El plan no puede tener simultáneamente configuración de financiación y tasa directa.',
            );
        }

        if (dto.financingConfigId) {
            await this.findOneConfig(societyId, dto.financingConfigId);
        }

        console.log('Actualizando plan de financiación', { societyId, financingPlanId });
        return this.planRepo.update(societyId, financingPlanId, dto);
    }

    async deletePlan(societyId: string, financingPlanId: string): Promise<void> {
        await this.findOnePlan(societyId, financingPlanId);
        console.log('Eliminando plan de financiación', { societyId, financingPlanId });
        await this.runDelete(
            () => this.planRepo.delete(societyId, financingPlanId),
            'No se puede eliminar: este plan tiene promociones o ventas vinculadas.',
        );
    }

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

        console.log('Creando promoción de financiación', { societyId, name: dto.name });
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

        console.log('Actualizando promoción de financiación', { societyId, promotionId });
        return this.promotionRepo.update(societyId, promotionId, dto);
    }

    async deletePromotion(societyId: string, promotionId: string): Promise<void> {
        await this.findOnePromotion(societyId, promotionId);
        console.log('Eliminando promoción de financiación', { societyId, promotionId });
        await this.runDelete(
            () => this.promotionRepo.delete(societyId, promotionId),
            'No se puede eliminar: esta promoción tiene ventas vinculadas.',
        );
    }
}
