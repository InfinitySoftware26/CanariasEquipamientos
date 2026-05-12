import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { StockalertsService } from './stockalerts.service';
import { CreateStockalertDto } from './dto/createStockalertDto';
import { UpdateStockalertDto } from './dto/updateStockalertDto';

@Controller('stockalerts')
export class StockalertsController {
  constructor(private readonly stockalertsService: StockalertsService) {}

  @Get()
  findAllStockAlerts() {
    return this.stockalertsService.findAllStockAlerts();
  }

  @Get(':id')
  findStockAlertById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.stockalertsService.findStockAlertById(id);
  }

  @Post()
  createStockAlert(@Body() alert: CreateStockalertDto) {
    return this.stockalertsService.createStockAlert(alert);
  }

  @Put(':id')
  updateStockAlertStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() alert: UpdateStockalertDto,
  ) {
    return this.stockalertsService.updateStockAlertStatus(id, alert);
  }

  @Delete(':id')
  deleteStockAlert(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.stockalertsService.deleteStockAlert(id);
  }
}
