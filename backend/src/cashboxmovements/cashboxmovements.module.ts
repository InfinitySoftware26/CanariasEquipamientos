import { Module } from '@nestjs/common';
import { CashboxmovementsService } from './cashboxmovements.service';
import { CashboxmovementsController } from './cashboxmovements.controller';
import { CashboxmovementsRepository } from './cashmovements.repository';

@Module({
  providers: [CashboxmovementsService, CashboxmovementsRepository],
  controllers: [CashboxmovementsController],
})
export class CashboxmovementsModule {}
