import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersController } from './controllers/suppliers.controller';
import { SuppliersService } from './services/suppliers.service';
import { SuppliersRepository } from './repositories/suppliers.repository';
import { Supplier } from './entities/supplier.entity';
import { SUPPLIERS_REPOSITORY } from './interfaces/suppliers-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SuppliersController],
  providers: [
    SuppliersService,
    { provide: SUPPLIERS_REPOSITORY, useClass: SuppliersRepository },
  ],
  exports: [SuppliersService],
})
export class SuppliersModule {}
