import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/createPaymentDto';
import { UpdatePaymentDto } from './dto/updatePaymentDto';

@Injectable()
export class PaymentsRepository {
  getAllPayments() {
    return 'Este método devuelve todos los pagos.';
  }

  getPaymentById(id: string) {
    return 'Este método devuelve un pago por su ID.';
  }

  getPaymentsByClientId(clientId: string) {
    return 'Este método devuelve los pagos por ID de cliente.';
  }

  getPaymentsByStaffId(staffId: string) {
    return 'Este método devuelve los pagos por ID de personal.(cobrador)';
  }

  createPayment(paymentData: CreatePaymentDto) {
    return 'Este método crea un nuevo pago.';
  }

  updatePayment(id: string, paymentData: UpdatePaymentDto) {
    return 'Este método actualiza un pago existente.';
  }

  deletePayment(id: string) {
    return 'Este método elimina un pago.';
  }
}
