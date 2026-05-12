import { Module } from '@nestjs/common';
import { CashboxController } from './cashbox.controller';
import { CashboxService } from './cashbox.service';
import { CashboxRepository } from './cashbox.repository';

@Module({
  controllers: [CashboxController],
  providers: [CashboxService, CashboxRepository],
})
export class CashboxModule {}
