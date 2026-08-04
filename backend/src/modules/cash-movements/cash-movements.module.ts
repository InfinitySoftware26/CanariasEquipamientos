import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashMovementsController } from './controllers/cash-movements.controller';
import { CashMovementsService } from './services/cash-movements.service';
import { CashMovementsRepository } from './repositories/cash-movements.repository';
import { CashMovement } from './entities/cash-movement.entity';
import { CASH_MOVEMENTS_REPOSITORY } from './interfaces/cash-movements-repository.interface';
import { CashboxModule } from '../cashbox/cashbox.module';

@Module({
  imports: [TypeOrmModule.forFeature([CashMovement]), CashboxModule],
  controllers: [CashMovementsController],
  providers: [
    CashMovementsService,
    { provide: CASH_MOVEMENTS_REPOSITORY, useClass: CashMovementsRepository },
  ],
  exports: [CashMovementsService],
})
export class CashMovementsModule {}
