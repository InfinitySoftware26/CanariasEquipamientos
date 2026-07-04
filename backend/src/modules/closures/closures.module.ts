import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClosuresController } from './controllers/closures.controller';
import { ClosuresService } from './services/closures.service';
import { ClosuresRepository } from './repositories/closures.repository';
import { DailyClosure } from './entities/daily-closure.entity';
import { RouteSheet } from '../route-sheets/entities/route-sheet.entity';
import { RouteSheetItem } from '../route-sheets/entities/route-sheet-item.entity';
import { CLOSURES_REPOSITORY } from './interfaces/closures-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([DailyClosure, RouteSheet, RouteSheetItem])],
  controllers: [ClosuresController],
  providers: [
    ClosuresService,
    { provide: CLOSURES_REPOSITORY, useClass: ClosuresRepository },
  ],
  exports: [ClosuresService],
})
export class ClosuresModule {}
