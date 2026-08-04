import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierPaymentsController } from './controllers/supplier-payments.controller';
import { SupplierPaymentsService } from './services/supplier-payments.service';
import { SupplierPaymentsRepository } from './repositories/supplier-payments.repository';
import { SupplierPayment } from './entities/supplier-payment.entity';
import { SUPPLIER_PAYMENTS_REPOSITORY } from './interfaces/supplier-payments-repository.interface';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { SupplierInvoicesModule } from '../supplier-invoices/supplier-invoices.module';

@Module({
  imports: [TypeOrmModule.forFeature([SupplierPayment]), SuppliersModule, SupplierInvoicesModule],
  controllers: [SupplierPaymentsController],
  providers: [
    SupplierPaymentsService,
    { provide: SUPPLIER_PAYMENTS_REPOSITORY, useClass: SupplierPaymentsRepository },
  ],
  exports: [SupplierPaymentsService],
})
export class SupplierPaymentsModule {}
