import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierInvoicesController } from './controllers/supplier-invoices.controller';
import { SupplierInvoicesService } from './services/supplier-invoices.service';
import { SupplierInvoicesRepository } from './repositories/supplier-invoices.repository';
import { SupplierInvoicePaymentApplicationsRepository } from './repositories/supplier-invoice-payment-applications.repository';
import { SupplierInvoice } from './entities/supplier-invoice.entity';
import { SupplierInvoicePaymentApplication } from './entities/supplier-invoice-payment-application.entity';
import { SUPPLIER_INVOICES_REPOSITORY } from './interfaces/supplier-invoices-repository.interface';
import {
  SUPPLIER_INVOICE_PAYMENT_APPLICATIONS_REPOSITORY,
} from './interfaces/supplier-invoice-payment-applications-repository.interface';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplierInvoice, SupplierInvoicePaymentApplication]),
    SuppliersModule,
  ],
  controllers: [SupplierInvoicesController],
  providers: [
    SupplierInvoicesService,
    { provide: SUPPLIER_INVOICES_REPOSITORY, useClass: SupplierInvoicesRepository },
    {
      provide: SUPPLIER_INVOICE_PAYMENT_APPLICATIONS_REPOSITORY,
      useClass: SupplierInvoicePaymentApplicationsRepository,
    },
  ],
  exports: [SupplierInvoicesService],
})
export class SupplierInvoicesModule {}
