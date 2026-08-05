import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashboxController } from './controllers/cashbox.controller';
import { CashboxService } from './services/cashbox.service';
import { CashboxRepository } from './repositories/cashbox.repository';
import { Cashbox } from './entities/cashbox.entity';
import { CashMovement } from '../cash-movements/entities/cash-movement.entity';
import { CASHBOX_REPOSITORY } from './interfaces/cashbox-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Cashbox, CashMovement])],
  controllers: [CashboxController],
  providers: [
    CashboxService,
    { provide: CASHBOX_REPOSITORY, useClass: CashboxRepository },
  ],
  exports: [CashboxService],
})
export class CashboxModule {}
