import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IReceiptsRepository, RECEIPTS_REPOSITORY } from '../interfaces/receipts-repository.interface';
import { Receipt } from '../entities/receipt.entity';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { buildReceiptPdf } from '../utils/receipt-pdf.util';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class ReceiptsService {
  constructor(
    @Inject(RECEIPTS_REPOSITORY)
    private readonly receiptsRepo: IReceiptsRepository,
  ) {}

  async findById(id: string): Promise<Receipt> {
    const receipt = await this.receiptsRepo.findById(id);
    if (!receipt) throw new NotFoundException(`Recibo ${id} no encontrado`);
    return receipt;
  }

  findBySociety(societyId: string): Promise<Receipt[]> {
    return this.receiptsRepo.findBySociety(societyId);
  }

  async create(dto: CreateReceiptDto, user: JwtPayload): Promise<Receipt> {
    if (!dto.paymentId && !dto.supplierPaymentId) {
      throw new BadRequestException('Debe indicar paymentId o supplierPaymentId');
    }
    if (dto.paymentId && dto.supplierPaymentId) {
      throw new BadRequestException('Un recibo no puede asociarse a un pago de cliente y a un pago a proveedor a la vez');
    }

    const lastNumber = await this.receiptsRepo.findLastNumberForSociety(user.societyId);

    return this.receiptsRepo.create({
      societyId: user.societyId,
      receiptNumber: lastNumber + 1,
      paymentId: dto.paymentId,
      supplierPaymentId: dto.supplierPaymentId,
      amount: dto.amount,
      issuedAt: new Date(),
    });
  }

  async generatePdf(id: string): Promise<Buffer> {
    const receipt = await this.findById(id);
    return buildReceiptPdf(receipt);
  }
}
