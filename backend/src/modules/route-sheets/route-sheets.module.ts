import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteSheetsController } from './controllers/route-sheets.controller';
import { RouteSheetItemsController } from './controllers/route-sheet-items.controller';
import { RouteSheetsService } from './services/route-sheets.service';
import { RouteSheetItemsService } from './services/route-sheet-items.service';
import { RouteSheetsRepository } from './repositories/route-sheets.repository';
import { RouteSheetItemsRepository } from './repositories/route-sheet-items.repository';
import { RouteSheet } from './entities/route-sheet.entity';
import { RouteSheetItem } from './entities/route-sheet-item.entity';
import { Zone } from '../zones/entities/zone.entity';
import { StaffZone } from '../zones/entities/staff-zone.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Client } from '../clients/entities/client.entity';
import { Installment } from '../installments/entities/installment.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SalesModule } from '../sales/sales.module';
import { InstallmentsModule } from '../installments/installments.module';
import { ROUTE_SHEETS_REPOSITORY } from './interfaces/route-sheets-repository.interface';
import { ROUTE_SHEET_ITEMS_REPOSITORY } from './interfaces/route-sheet-items-repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([RouteSheet, RouteSheetItem, Zone, StaffZone, Staff, Client, Installment, Sale]),
    SalesModule,
    InstallmentsModule,
  ],
  controllers: [RouteSheetsController, RouteSheetItemsController],
  providers: [
    RouteSheetsService,
    RouteSheetItemsService,
    { provide: ROUTE_SHEETS_REPOSITORY, useClass: RouteSheetsRepository },
    { provide: ROUTE_SHEET_ITEMS_REPOSITORY, useClass: RouteSheetItemsRepository },
  ],
  exports: [RouteSheetsService, RouteSheetItemsService],
})
export class RouteSheetsModule {}
