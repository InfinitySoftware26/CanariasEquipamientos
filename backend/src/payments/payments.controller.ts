import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/createPaymentDto';
import { UpdatePaymentDto } from './dto/updatePaymentDto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  @Get()
  getAllPayments() {
    return this.paymentsService.getAllPaymentsService();
  }

  @Get(':id')
  getPaymentById(@Param('id') id: string) {
    return this.paymentsService.getPaymentByIdService(id);
  }

  @Get('client/:clientId')
  getPaymentsByClientId(@Param('clientId') clientId: string) {
    return this.paymentsService.getPaymentsByClientIdService(clientId);
  }

  @Get('staff/:staffId')
  getPaymentsByStaffId(@Param('staffId') staffId: string) {
    return this.paymentsService.getPaymentsByStaffIdService(staffId);
  }

  @Post()
  createPayment(@Body() paymentData: CreatePaymentDto) {
    return this.paymentsService.createPaymentService(paymentData);
  }

  @Put(':id')
  updatePayment(
    @Param('id') id: string,
    @Body() paymentData: UpdatePaymentDto,
  ) {
    return this.paymentsService.updatePaymentService(id, paymentData);
  }

  @Patch(':id')
  deletePayment(@Param('id') id: string) {
    return this.paymentsService.deletePaymentService(id);
  }
}
