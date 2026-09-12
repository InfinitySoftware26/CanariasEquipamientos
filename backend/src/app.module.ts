import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { DatabaseModule } from "./database/database.module";
import { appConfig, validateConfig } from "./config/app.config";
import { AuthModule } from "./modules/auth/auth.module";
import { SocietiesModule } from "./modules/societies/societies.module";
import { StaffModule } from "./modules/staff/staff.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { ZonesModule } from "./modules/zones/zones.module";
import { ProductsModule } from "./modules/products/products.module";
import { FinancingModule } from "./modules/financing/financing.module";
import { SuppliersModule } from "./modules/suppliers/suppliers.module";
import { SalesModule } from "./modules/sales/sales.module";
import { InstallmentsModule } from "./modules/installments/installments.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { RouteSheetsModule } from "./modules/route-sheets/route-sheets.module";
import { ClosuresModule } from "./modules/closures/closures.module";
import { SettlementsModule } from "./modules/settlements/settlements.module";
import { CashboxModule } from "./modules/cashbox/cashbox.module";
import { CashMovementsModule } from "./modules/cash-movements/cash-movements.module";
import { SupplierInvoicesModule } from "./modules/supplier-invoices/supplier-invoices.module";
import { SupplierPaymentsModule } from "./modules/supplier-payments/supplier-payments.module";
import { ReceiptsModule } from "./modules/receipts/receipts.module";
import { FailedVisitsModule } from "./modules/failed-visits/failed-visits.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { NotificationDeliveriesModule } from "./modules/notification-deliveries/notification-deliveries.module";
import { UserConfigurationsModule } from "./modules/user-configurations/user-configurations.module";
import { HealthModule } from "@modules/health/health.module";
import { JwtAuthGuard } from "@common/guards";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: validateConfig,
      envFilePath: [".env.local", ".env"],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    AuthModule,
    SocietiesModule,
    StaffModule,
    ClientsModule,
    ZonesModule,
    ProductsModule,
    FinancingModule,
    SuppliersModule,
    SalesModule,
    InstallmentsModule,
    PaymentsModule,
    FailedVisitsModule,
    RouteSheetsModule,
    ClosuresModule,
    SettlementsModule,
    CashboxModule,
    CashMovementsModule,
    SupplierInvoicesModule,
    SupplierPaymentsModule,
    ReceiptsModule,
    ReportsModule,
    NotificationsModule,
    NotificationDeliveriesModule,
    UserConfigurationsModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule { }
