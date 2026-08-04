import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentsRepository } from './repositories/payments.repository';
import { PaymentInstallmentApplicationsRepository } from './repositories/payment-installment-applications.repository';
import { Payment } from './entities/payment.entity';
import { PaymentInstallmentApplication } from './entities/payment-installment-application.entity';
import { PAYMENTS_REPOSITORY } from './interfaces/payments-repository.interface';
import { PAYMENT_INSTALLMENT_APPLICATIONS_REPOSITORY } from './interfaces/payment-installment-applications-repository.interface';
import { InstallmentsModule } from '../installments/installments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentInstallmentApplication]),
    InstallmentsModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    { provide: PAYMENTS_REPOSITORY, useClass: PaymentsRepository },
    { provide: PAYMENT_INSTALLMENT_APPLICATIONS_REPOSITORY, useClass: PaymentInstallmentApplicationsRepository },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
