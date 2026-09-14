import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from '../entities/promotion.entity';
import { IPromotionRepository } from '../interfaces/promotion-repository.interface';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
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
            relations: ['products', 'plan', 'plan.financingConfiguration', 'plan.products'],
        });
    }

    async findAllBySociety(societyId: string): Promise<Promotion[]> {
        return this.repo.find({
            where: { societyId },
            relations: ['products', 'plan', 'plan.financingConfiguration', 'plan.products'],
            order: { createdAt: 'DESC' },
        });
    }

    async findById(
        societyId: string,
        promotionId: string,
    ): Promise<Promotion | null> {
        return this.repo.findOne({
            where: { societyId, promotionId },
            relations: ['products', 'plan', 'plan.financingConfiguration', 'plan.products'],
        });
    }

    async update(
        societyId: string,
        promotionId: string,
        dto: UpdatePromotionDto,
    ): Promise<Promotion> {
        const promotion = await this.repo.findOneOrFail({
            where: { societyId, promotionId },
            relations: ['products'],
        });

        if (dto.name !== undefined) promotion.name = dto.name;
        if (dto.financingPlanId !== undefined) promotion.financingPlanId = dto.financingPlanId;
        if (dto.discountPercentage !== undefined) promotion.discountPercentage = dto.discountPercentage;
        if (dto.paymentFrequency !== undefined) promotion.paymentFrequency = dto.paymentFrequency;
        if (dto.installmentsCount !== undefined) promotion.installmentsCount = dto.installmentsCount;
        if (dto.isGlobal !== undefined) promotion.isGlobal = dto.isGlobal;

        if (dto.productIds !== undefined) {
            if (promotion.isGlobal) {
                promotion.products = [];
            } else {
                promotion.products = (dto.productIds || []).map((id) => ({ productId: id } as any));
            }
        }

        await this.repo.save(promotion);

        return this.repo.findOneOrFail({
            where: { societyId, promotionId },
            relations: ['products', 'plan', 'plan.financingConfiguration', 'plan.products'],
        });
    }

    async delete(societyId: string, promotionId: string): Promise<void> {
        await this.repo.delete({ societyId, promotionId });
    }
}
