import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `Esta accion devuelve todos los auth`;
  }

  findOne(id: number) {
    return `Esta accion devuelve un auth `;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `Esta accion actualiza un auth `;
  }

  remove(id: number) {
    return `Esta accion elimina un auth `;
  }
}
