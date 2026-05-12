import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CashboxmovementsService } from './cashboxmovements.service';
import { CreateCashboxMovementDto } from './dto/createCashMovementDto';

@Controller('cashboxmovements')
export class CashboxmovementsController {
  constructor(
    private readonly cashboxmovementsService: CashboxmovementsService,
  ) {}

  @Post()
  create(@Body() CreateCashboxMovement: CreateCashboxMovementDto) {
    return this.cashboxmovementsService.create(CreateCashboxMovement);
  }

  @Get()
  findAll() {
    return this.cashboxmovementsService.findAll();
  }

  @Get()
  findOne(@Param('id') id: string) {
    return this.cashboxmovementsService.findOne(id);
  }
}
