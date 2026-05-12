import { Injectable } from '@nestjs/common';
import { AddCashboxDto } from './dto/updateCashboxDto';

@Injectable()
export class CashboxRepository {
  findAllCashBox() {
    return 'Esta accion devuelve todos los dias de caja';
  }
  findOneCashbox(id: string) {
    return `Esta accion devuelve el dia de caja #${id}`;
  }
  createCashbox(cashbox: AddCashboxDto) {
    return `Esta accion crea el dia de caja`;
  }
}
