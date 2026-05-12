import { Controller, Patch } from '@nestjs/common';
import {
  Body,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/createSalesDto';
import { UpdateSaleDto } from './dto/updateSalesDto';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() sale: CreateSaleDto) {
    return this.salesService.createService(sale);
  }

  @Get()
  findAll() {
    return this.salesService.salesFindAllService();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.salesService.salesFindOneService(id);
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId', new ParseUUIDPipe()) clientId: string) {
    return this.salesService.salesFindByClientService(clientId);
  }

  @Get('staff/:staffId')
  findByStaff(@Param('staffId', new ParseUUIDPipe()) staffId: string) {
    return this.salesService.salesFindByStaffService(staffId);
  }

  @Get('date/:from/:to')
  findByDateRange(@Param('from') from: string, @Param('to') to: string) {
    return this.salesService.salesFindByDateRangeService(from, to);
  }

  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() sale: UpdateSaleDto,
  ) {
    return this.salesService.salesUpdateService(id, sale);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.salesService.saleDeleteService(id);
  }
}
