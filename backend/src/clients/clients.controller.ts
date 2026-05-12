import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateClientDto } from './dto/createClientDto';
import { ClientsService } from './clients.service';
import { UpdateClientDto } from './dto/updateClientDto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  create(@Body() client: CreateClientDto) {
    return this.clientsService.create(client);
  }

  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() client: UpdateClientDto,
  ) {
    return this.clientsService.update(id, client);
  }

  @Delete(':id')
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    // Soft delete: cambiar status a inactive
    return this.clientsService.delete(id);
  }
}
