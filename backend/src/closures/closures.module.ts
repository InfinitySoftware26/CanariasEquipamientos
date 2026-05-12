import { Module } from '@nestjs/common';
import { ClosuresController } from './closures.controller';
import { ClosuresService } from './closures.service';
import { clousuresRepository } from './closures.repository';

@Module({
  controllers: [ClosuresController],
  providers: [ClosuresService, clousuresRepository],
})
export class ClosuresModule {}
