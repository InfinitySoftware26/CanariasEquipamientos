import { Module } from '@nestjs/common';
import { SetlementsController } from './setlements.controller';
import { SetlementsService } from './setlements.service';

@Module({
  controllers: [SetlementsController],
  providers: [SetlementsService],
})
export class SetlementsModule {}
