import { Injectable } from '@nestjs/common';
import { AddSocietyDto } from './dto/addSocietyDto';

@Injectable()
export class SocietyRepository {
  findAllSocieties() {
    return 'Esta accion devuelve todas las sociedades';
  }

  findOneSociety(id: string) {
    return `Esta accion devuelve la sociedad #${id}`;
  }

  createSociety(society: AddSocietyDto) {
    return `Esta accion crea la sociedad`;
  }
}