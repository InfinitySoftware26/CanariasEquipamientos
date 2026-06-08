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
import { SuppliersModule } from "./modules/suppliers/suppliers.module";
import { SalesModule } from "./modules/sales/sales.module";
import { InstallmentsModule } from "./modules/installments/installments.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { RouteSheetsModule } from "./modules/route-sheets/route-sheets.module";
import { ClosuresModule } from "./modules/closures/closures.module";
import { CashboxModule } from "./modules/cashbox/cashbox.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { HealthModule } from "@modules/health/health.module";

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
    SuppliersModule,
    SalesModule,
    InstallmentsModule,
    PaymentsModule,
    RouteSheetsModule,
    ClosuresModule,
    CashboxModule,
    NotificationsModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
