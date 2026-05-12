import { Injectable } from '@nestjs/common';
import { PaymentSupplierIsRepository } from './paymentsupplieris.repository';
import { CreatePaymentSupplierDto } from './dto/createPaymentSupplierDto';
import { UpdatePaymentSupplierDto } from './dto/updatePaymentSupplierDto';

@Injectable()
export class PaymentsupplierisService {
  constructor(
    private readonly paymentsupplierisRepository: PaymentSupplierIsRepository,
  ) {}
  findAllService(): string {
    return this.paymentsupplierisRepository.findAll();
  }
  findOneService(id: string): string {
    return this.paymentsupplierisRepository.findOne(id);
  }
  findBySupplierIdService(supplierId: string): string {
    return this.paymentsupplierisRepository.findBySupplierId(supplierId);
  }
  createService(PaymentSupplieriData: CreatePaymentSupplierDto): string {
    return this.paymentsupplierisRepository.create(PaymentSupplieriData);
  }
  updateService(
    id: string,
    PaymentSupplieriData: UpdatePaymentSupplierDto,
  ): string {
    return this.paymentsupplierisRepository.update(id, PaymentSupplieriData);
  }
}
