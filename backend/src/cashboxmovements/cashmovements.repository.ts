import { Injectable } from '@nestjs/common';
import { CreateCashboxMovementDto } from './dto/createCashMovementDto';

@Injectable()
export class CashboxmovementsRepository {
  create(createCashboxMovement: CreateCashboxMovementDto) {
    return 'Esta accion crea el diario de caja (apertura y cierre)';
  }
  findAll() {
    return 'Esta accion devuelve todos los movimientos de caja';
  }
  findOne(id: string) {
    return `Esta accion devuelve un movimiento de caja`;
  }
}
