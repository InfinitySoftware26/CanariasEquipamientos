import { Module } from '@nestjs/common';
import { PaymentsupplierisController } from './paymentsupplieris.controller';
import { PaymentsupplierisService } from './paymentsupplieris.service';
import { PaymentSupplierIsRepository } from './paymentsupplieris.repository';

@Module({
  controllers: [PaymentsupplierisController],
  providers: [PaymentsupplierisService, PaymentSupplierIsRepository],
})
export class PaymentsupplierisModule {}
