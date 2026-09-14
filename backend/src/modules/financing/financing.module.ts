import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancingController } from './controllers/financing.controller';
import { FinancingService } from './services/financing.service';
import { FinancingConfigRepository } from './repositories/financing-config.repository';
import { FinancingPlanRepository } from './repositories/financing-plan.repository';
import { PromotionRepository } from './repositories/promotion.repository';
import { FinancingConfiguration } from './entities/financing-configuration.entity';
import { FinancingPlan } from './entities/financing-plan.entity';
import { Promotion } from './entities/promotion.entity';
import { FINANCING_CONFIG_REPOSITORY } from './interfaces/financing-config-repository.interface';
import { FINANCING_PLAN_REPOSITORY } from './interfaces/financing-plan-repository.interface';
import { PROMOTION_REPOSITORY } from './interfaces/promotion-repository.interface';
@Module({
    imports: [
        TypeOrmModule.forFeature([
            FinancingConfiguration,
            FinancingPlan,
            Promotion,
        ]),
    ],
    controllers: [FinancingController],
    providers: [
        FinancingService,
        {
            provide: FINANCING_CONFIG_REPOSITORY,
            useClass: FinancingConfigRepository,
        },
        {
            provide: FINANCING_PLAN_REPOSITORY,
            useClass: FinancingPlanRepository,
        },
        {
            provide: PROMOTION_REPOSITORY,
            useClass: PromotionRepository,
        },
    ],
    exports: [FinancingService],
})
export class FinancingModule { }
