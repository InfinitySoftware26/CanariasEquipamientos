import { Injectable } from '@nestjs/common';
import { createReceiptDto } from './dto/createReceiptDto';
import { ReceiptsRepository } from './receipts.repository';

@Injectable()
export class ReceiptsService {
    constructor(private readonly receiptsRepository: ReceiptsRepository) {}

    allReceiptsServices() {
        return this.receiptsRepository.findAllReceipts();
    }
    receiptByIdService(id: string) {
        return this.receiptsRepository.findReceiptById(id);
    }
    receiptsByClientIdService(clientId: string) {
        return this.receiptsRepository.findReceiptsByClientId(clientId);
    }
    receiptsByStaffIdService(staffId: string) {
        return this.receiptsRepository.findReceiptsByStaffId(staffId);
    }
    receiptsByPaymentIdService(paymentId: string) {
        return this.receiptsRepository.findReceiptsByPaymentId(paymentId);
    }
    createReceiptService(receiptDate: createReceiptDto) {
        return this.receiptsRepository.createReceipt(receiptDate);
    }
    updateReceiptStatusService(id: string, status: string) {
        return this.receiptsRepository.updateReceiptStatus(id, status);
    }
}
