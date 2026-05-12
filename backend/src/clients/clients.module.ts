import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { ClientsRepository } from './clients.repository';

@Module({
  providers: [ClientsService, ClientsRepository],
  controllers: [ClientsController],
})
export class ClientsModule {}
