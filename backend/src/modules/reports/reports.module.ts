import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { RouteSheetsModule } from '../route-sheets/route-sheets.module';
import { PaymentsModule } from '../payments/payments.module';
import { InstallmentsModule } from '../installments/installments.module';
import { FailedVisitsModule } from '../failed-visits/failed-visits.module';
import { CashboxModule } from '../cashbox/cashbox.module';
import { CashMovementsModule } from '../cash-movements/cash-movements.module';
import { SupplierPaymentsModule } from '../supplier-payments/supplier-payments.module';
import { ReceiptsModule } from '../receipts/receipts.module';

@Module({
  imports: [
    RouteSheetsModule,
    PaymentsModule,
    InstallmentsModule,
    FailedVisitsModule,
    CashboxModule,
    CashMovementsModule,
    SupplierPaymentsModule,
    ReceiptsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
