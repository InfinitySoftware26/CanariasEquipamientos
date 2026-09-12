import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from '../entities/promotion.entity';
import { IPromotionRepository } from '../interfaces/promotion-repository.interface';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';

/**
 * PromotionRepository
 *
 * Acceso a datos para Promotion con garantía de aislamiento por societyId.
 */
@Injectable()
export class PromotionRepository implements IPromotionRepository {
    constructor(
        @InjectRepository(Promotion)
        private readonly repo: Repository<Promotion>,
    ) { }

    async create(societyId: string, dto: CreatePromotionDto): Promise<Promotion> {
        const promotion = this.repo.create({
            societyId,
            name: dto.name,
            financingPlanId: dto.financingPlanId ?? null,
            discountPercentage: dto.discountPercentage ?? null,
            paymentFrequency: dto.paymentFrequency ?? null,
            installmentsCount: dto.installmentsCount ?? null,
            isGlobal: dto.isGlobal ?? false,
            isActive: true,
        });

        const saved = await this.repo.save(promotion);

        if (dto.productIds && dto.productIds.length > 0) {
            await this.repo
                .createQueryBuilder()
                .relation(Promotion, 'products')
                .of(saved)
                .add(dto.productIds);
        }

        return this.repo.findOneOrFail({
            where: { promotionId: saved.promotionId },
            relations: ['products', 'plan'],
        });
    }

    async findAllBySociety(societyId: string): Promise<Promotion[]> {
        return this.repo.find({
            where: { societyId },
            relations: ['products', 'plan'],
            order: { createdAt: 'DESC' },
        });
    }

    async findById(
        societyId: string,
        promotionId: string,
    ): Promise<Promotion | null> {
        return this.repo.findOne({
            where: { societyId, promotionId },
            relations: ['products', 'plan'],
        });
    }

    async update(
        societyId: string,
        promotionId: string,
        dto: UpdatePromotionDto,
    ): Promise<Promotion> {
        await this.repo.update(
            { societyId, promotionId },
            {
                name: dto.name,
                financingPlanId: dto.financingPlanId,
                discountPercentage: dto.discountPercentage,
                paymentFrequency: dto.paymentFrequency,
                installmentsCount: dto.installmentsCount,
                isGlobal: dto.isGlobal,
            },
        );

        if (dto.productIds) {
            const promotion = await this.repo.findOneOrFail({
                where: { societyId, promotionId },
            });
            await this.repo
                .createQueryBuilder()
                .relation(Promotion, 'products')
                .of(promotion)
                .set(dto.productIds);
        }

        return this.repo.findOneOrFail({
            where: { societyId, promotionId },
            relations: ['products', 'plan'],
        });
    }

    async delete(societyId: string, promotionId: string): Promise<void> {
        await this.repo.delete({ societyId, promotionId });
    }
}
