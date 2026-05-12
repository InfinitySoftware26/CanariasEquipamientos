import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { PaymentsupplierisService } from './paymentsupplieris.service';
import { CreatePaymentSupplierDto } from './dto/createPaymentSupplierDto';
import { UpdatePaymentSupplierDto } from './dto/updatePaymentSupplierDto';

@Controller('paymentsupplieris')
export class PaymentsupplierisController {
  constructor(
    private readonly paymentsupplierisService: PaymentsupplierisService,
  ) {}

  @Get()
  findAll(): string {
    return this.paymentsupplierisService.findAllService();
  }
  @Get(':id')
  findOne(@Param('id') id: string): string {
    return this.paymentsupplierisService.findOneService(id);
  }
  @Get('supplier/:supplierId')
  findBySupplierId(@Param('supplierId') supplierId: string): string {
    return this.paymentsupplierisService.findBySupplierIdService(supplierId);
  }
  @Post()
  create(@Body() PaymentSupplieriData: CreatePaymentSupplierDto): string {
    return this.paymentsupplierisService.createService(PaymentSupplieriData);
  }
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() PaymentSupplieriData: UpdatePaymentSupplierDto,
  ): string {
    return this.paymentsupplierisService.updateService(id, PaymentSupplieriData);
  }
}
