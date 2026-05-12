import { Injectable } from '@nestjs/common';
import { AddCashboxDto } from './dto/updateCashboxDto';
import { CashboxRepository } from './cashbox.repository';

@Injectable()
export class CashboxService {
  constructor(private readonly cashboxRepository: CashboxRepository) {}
  findAllCashbox() {
    return this.cashboxRepository.findAllCashBox();
  }

  findOneCashbox(id: string) {
    return this.cashboxRepository.findOneCashbox(id);
  }

  addCashbox(cashbox: AddCashboxDto) {
    return this.cashboxRepository.createCashbox(cashbox);
  }
}
