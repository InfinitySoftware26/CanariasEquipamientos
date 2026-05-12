import { Injectable } from '@nestjs/common';
import { CashboxmovementsRepository } from './cashmovements.repository';
import { CreateCashboxMovementDto } from './dto/createCashMovementDto';

@Injectable()
export class CashboxmovementsService {
  constructor(
    private readonly cashboxmovementsRepository: CashboxmovementsRepository,
  ) {}

  create(createCashMovement: CreateCashboxMovementDto) {
    return this.cashboxmovementsRepository.create(createCashMovement);
  }
  findAll() {
    return this.cashboxmovementsRepository.findAll();
  }
  findOne(id: string) {
    return this.cashboxmovementsRepository.findOne(id);
  }
}
