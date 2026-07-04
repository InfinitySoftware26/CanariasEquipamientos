import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettlementsController } from './controllers/settlements.controller';
import { SettlementsService } from './services/settlements.service';
import { SettlementsRepository } from './repositories/settlements.repository';
import { Settlement } from './entities/settlement.entity';
import { DailyClosure } from '../closures/entities/daily-closure.entity';
import { RouteSheet } from '../route-sheets/entities/route-sheet.entity';
import { RouteSheetItem } from '../route-sheets/entities/route-sheet-item.entity';
import { Installment } from '../installments/entities/installment.entity';
import { SETTLEMENTS_REPOSITORY } from './interfaces/settlements-repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Settlement, DailyClosure, RouteSheet, RouteSheetItem, Installment]),
  ],
  controllers: [SettlementsController],
  providers: [
    SettlementsService,
    { provide: SETTLEMENTS_REPOSITORY, useClass: SettlementsRepository },
  ],
  exports: [SettlementsService],
})
export class SettlementsModule {}
