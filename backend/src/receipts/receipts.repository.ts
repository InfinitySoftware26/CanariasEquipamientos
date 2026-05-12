import { Injectable } from '@nestjs/common';
import { createReceiptDto } from './dto/createReceiptDto';

@Injectable()
export class ReceiptsRepository {
  findAllReceipts() {
    return 'este metodo devuelve todos los recibos';
  }
  findReceiptById(id: string) {
    return 'este metodo devuelve un recibo por su ID';
  }
  findReceiptsByClientId(clientId: string) {
    return 'este metodo devuelve recibos por ID de cliente';
  }
  findReceiptsByStaffId(staffId: string) {
    return 'este metodo devuelve recibos por ID de cobrador';
  }
  findReceiptsByPaymentId(paymentId: string) {
    return 'este metodo devuelve recibos por ID de pago';
  }
  createReceipt(receiptDate: createReceiptDto) {
    return 'este metodo crea un nuevo recibo (automatico con el pago)';
  }
  updateReceiptStatus(id: string, status: string) {
    return 'este metodo actualiza el estado de un recibo';
  }
}
