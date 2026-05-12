import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { createReceiptDto } from './dto/createReceiptDto';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  getAllReceipts() {
    return this.receiptsService.allReceiptsServices();
  }

  @Get(':id')
  getReceiptById(@Param('id') id: string) {
    return this.receiptsService.receiptByIdService(id);
  }

  @Get('client/:clientId')
  getReceiptsByClientId(@Param('clientId') clientId: string) {
    return this.receiptsService.receiptsByClientIdService(clientId);
  }

  @Get('staff/:staffId')
  getReceiptsByStaffId(@Param('staffId') staffId: string) {
    return this.receiptsService.receiptsByStaffIdService(staffId);
  }

  @Get('payment/:paymentId')
  getReceiptsByPaymentId(@Param('paymentId') paymentId: string) {
    return this.receiptsService.receiptsByPaymentIdService(paymentId);
  }

  @Post()
  createReceipt(@Body() receiptDate: createReceiptDto) {
    return this.receiptsService.createReceiptService(receiptDate);
  }

  @Patch(':id/status')
  updateReceiptStatus(
    @Param('id') id: string,
    @Body() status: { status: string },
  ) {
    return this.receiptsService.updateReceiptStatusService(id, status.status);
  }
}
