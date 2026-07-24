import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './controllers/sales.controller';
import { SalesService } from './services/sales.service';
import { SalesRepository } from './repositories/sales.repository';
import { SaleValidationsRepository } from './repositories/sale-validations.repository';
import { DeliveryAttemptsRepository } from './repositories/delivery-attempts.repository';
import { SaleHistoryRepository } from './repositories/sale-history.repository';
import { Sale } from './entities/sale.entity';
import { SaleProduct } from './entities/sale-product.entity';
import { SaleValidation } from './entities/sale-validation.entity';
import { DeliveryAttempt } from './entities/delivery-attempt.entity';
import { SaleHistory } from './entities/sale-history.entity';
import { Installment } from '../installments/entities/installment.entity';
import { Staff } from '../staff/entities/staff.entity';
import { FinancingConfigModule } from '../financing-config/financing-config.module';
import { SALES_REPOSITORY } from './interfaces/sales-repository.interface';
import { SALE_VALIDATIONS_REPOSITORY } from './interfaces/sale-validations-repository.interface';
import { DELIVERY_ATTEMPTS_REPOSITORY } from './interfaces/delivery-attempts-repository.interface';
import { SALE_HISTORY_REPOSITORY } from './interfaces/sale-history-repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      SaleProduct,
      SaleValidation,
      DeliveryAttempt,
      SaleHistory,
      Installment,
      Staff,
    ]),
    FinancingConfigModule,
  ],
  controllers: [SalesController],
  providers: [
    SalesService,
    { provide: SALES_REPOSITORY,             useClass: SalesRepository },
    { provide: SALE_VALIDATIONS_REPOSITORY,  useClass: SaleValidationsRepository },
    { provide: DELIVERY_ATTEMPTS_REPOSITORY, useClass: DeliveryAttemptsRepository },
    { provide: SALE_HISTORY_REPOSITORY,      useClass: SaleHistoryRepository },
  ],
  exports: [SalesService],
})
export class SalesModule {}
