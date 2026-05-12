import { Injectable } from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { CreatePaymentDto } from './dto/createPaymentDto';
import { UpdatePaymentDto } from './dto/updatePaymentDto';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}
  getAllPaymentsService() {
    return this.paymentsRepository.getAllPayments();
  }

  getPaymentByIdService(id: string) {
    return this.paymentsRepository.getPaymentById(id);
  }

  getPaymentsByClientIdService(clientId: string) {
    return this.paymentsRepository.getPaymentsByClientId(clientId);
  }

  getPaymentsByStaffIdService(staffId: string) {
    return this.paymentsRepository.getPaymentsByStaffId(staffId);
  }

  createPaymentService(paymentData: CreatePaymentDto) {
    return this.paymentsRepository.createPayment(paymentData);
  }

  updatePaymentService(id: string, paymentData: UpdatePaymentDto) {
    return this.paymentsRepository.updatePayment(id, paymentData);
  }

  deletePaymentService(id: string) {
    return this.paymentsRepository.deletePayment(id);
  }
}
