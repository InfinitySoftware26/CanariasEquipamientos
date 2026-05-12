import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { CreateInstallmentDto } from './dto/createInstallmentDto';
import { UpdateInstallmentDto } from './dto/updateInstalmentDto';

@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Get()
  getAllInstallments() {
    return this.installmentsService.getAllInstallmentsService();
  }

  @Get(':id')
  getInstallmentById(@Param('id') id: string) {
    return this.installmentsService.getInstallmentByIdService(id);
  }

  @Get('sales/:saleId')
  getinstallmentBySaleId(@Param('saleId') saleId: string) {
    return this.installmentsService.getinstallmentBySaleIdService(saleId);
  }

  @Get('client/:clientId')
  getinstallmentByClientId(@Param('clientId') clientId: string) {
    return this.installmentsService.getinstallmentByClientIdService(clientId);
  }

  @Post()
  createInstallment(@Body() createInstallment: CreateInstallmentDto) {
    return this.installmentsService.createInstallmentService(createInstallment);
  }

  @Put(':id')
  updateInstallment(
    @Param('id') id: string,
    @Body() updateInstallment: UpdateInstallmentDto,
  ) {
    return this.installmentsService.updateInstallmentService(
      id,
      updateInstallment,
    );
  }
}
