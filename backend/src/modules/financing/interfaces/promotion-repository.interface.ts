import { Promotion } from '../entities/promotion.entity';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
export interface IPromotionRepository {
    create(societyId: string, dto: CreatePromotionDto): Promise<Promotion>;

    findAllBySociety(societyId: string): Promise<Promotion[]>;

    findById(
        societyId: string,
        promotionId: string,
    ): Promise<Promotion | null>;

    update(
        societyId: string,
        promotionId: string,
        dto: UpdatePromotionDto,
    ): Promise<Promotion>;

    delete(societyId: string, promotionId: string): Promise<void>;
}

export const PROMOTION_REPOSITORY = 'IPromotionRepository';
