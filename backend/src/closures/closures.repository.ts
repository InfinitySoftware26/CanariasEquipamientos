import { Injectable } from '@nestjs/common';
import { CreateClosureDto } from './dto/createClouseDto';

@Injectable()
export class clousuresRepository {
  findAll() {
    return 'Esta accion devuelve todos los cierres';
  }

  findById(id: string) {
    return `Esta accion devuelve un cierre`;
  }

  create(closure: CreateClosureDto) {
    return 'Esta accion crea un cierre';
  }

  findByStaffId(staffId: string) {
    return `Esta accion devuelve los cierres por id de staff`;
  }
}
