import { Module } from '@nestjs/common';
import { StockalertsService } from './stockalerts.service';
import { StockalertsController } from './stockalerts.controller';
import { StockalertsRepository } from './stockalerts.repository';

@Module({
  providers: [StockalertsService, StockalertsRepository],
  controllers: [StockalertsController],
})
export class StockalertsModule { }
