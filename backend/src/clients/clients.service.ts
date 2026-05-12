import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/createClientDto';
import { UpdateClientDto } from './dto/updateClientDto';
import { ClientsRepository } from './clients.repository';
import { ClientStatus } from './enums/client-status.enum';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}
  findAll() {
    return this.clientsRepository.findAll();
  }

  findOne(id: string) {
    return this.clientsRepository.findOne(id);
  }
  create(client: CreateClientDto) {
    return this.clientsRepository.create(client);
  }
  update(id: string, client: UpdateClientDto) {
    return this.clientsRepository.update(id, client);
  }
  delete(id: string) {
    // Soft delete: cambiar status a inactive
    const updateData: UpdateClientDto = { status: ClientStatus.INACTIVE };
    return this.clientsRepository.update(id, updateData);
  }
}
