import { Module } from '@nestjs/common';
import { StockmovementsController } from './stockmovements.controller';
import { StockmovementsService } from './stockmovements.service';

@Module({
  controllers: [StockmovementsController],
  providers: [StockmovementsService],
})
export class StockmovementsModule {}
