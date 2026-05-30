import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsController } from "./controllers/clients.controller";
import { ClientsService } from "./services/clients.service";
import { ClientsRepository } from "./repositories/clients.repository";
import { CLIENTS_REPOSITORY } from "./interfaces/clients-repository.interface";
import { Client } from "./entities/client.entity";
import { ClientHistory } from "./entities/client-history.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Client, ClientHistory])],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    { provide: CLIENTS_REPOSITORY, useClass: ClientsRepository },
  ],
  exports: [ClientsService],
})
export class ClientsModule {}
