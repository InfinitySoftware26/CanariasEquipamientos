import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancingPlan } from '../entities/financing-plan.entity';
import { IFinancingPlanRepository } from '../interfaces/financing-plan-repository.interface';
import { CreateFinancingPlanDto } from '../dto/create-financing-plan.dto';
import { UpdateFinancingPlanDto } from '../dto/update-financing-plan.dto';

/**
 * FinancingPlanRepository
 *
 * Acceso a datos para FinancingPlan con garantía de aislamiento por societyId.
 */
@Injectable()
export class FinancingPlanRepository implements IFinancingPlanRepository {
    constructor(
        @InjectRepository(FinancingPlan)
        private readonly repo: Repository<FinancingPlan>,
    ) { }

    async create(
        societyId: string,
        dto: CreateFinancingPlanDto,
    ): Promise<FinancingPlan> {
        const plan = this.repo.create({
            societyId,
            name: dto.name,
            financingConfigId: dto.financingConfigId,
            paymentFrequency: dto.paymentFrequency,
            installmentsCount: dto.installmentsCount,
            isGlobal: dto.isGlobal ?? true,
            isActive: true,
        });

        const saved = await this.repo.save(plan);

        if (dto.productIds && dto.productIds.length > 0) {
            await this.repo
                .createQueryBuilder()
                .relation(FinancingPlan, 'products')
                .of(saved)
                .add(dto.productIds);
        }

        return this.repo.findOneOrFail({
            where: { financingPlanId: saved.financingPlanId },
            relations: ['products', 'financingConfiguration'],
        });
    }

    async findAllBySociety(societyId: string): Promise<FinancingPlan[]> {
        return this.repo.find({
            where: { societyId },
            relations: ['products', 'financingConfiguration'],
            order: { createdAt: 'DESC' },
        });
    }

    async findById(
        societyId: string,
        financingPlanId: string,
    ): Promise<FinancingPlan | null> {
        return this.repo.findOne({
            where: { societyId, financingPlanId },
            relations: ['products', 'financingConfiguration'],
        });
    }

    async update(
        societyId: string,
        financingPlanId: string,
        dto: UpdateFinancingPlanDto,
    ): Promise<FinancingPlan> {
        await this.repo.update(
            { societyId, financingPlanId },
            {
                name: dto.name,
                financingConfigId: dto.financingConfigId,
                paymentFrequency: dto.paymentFrequency,
                installmentsCount: dto.installmentsCount,
                isGlobal: dto.isGlobal,
            },
        );

        if (dto.productIds) {
            const plan = await this.repo.findOneOrFail({
                where: { societyId, financingPlanId },
            });
            await this.repo
                .createQueryBuilder()
                .relation(FinancingPlan, 'products')
                .of(plan)
                .set(dto.productIds);
        }

        return this.repo.findOneOrFail({
            where: { societyId, financingPlanId },
            relations: ['products', 'financingConfiguration'],
        });
    }

    async delete(societyId: string, financingPlanId: string): Promise<void> {
        await this.repo.delete({ societyId, financingPlanId });
    }
}
