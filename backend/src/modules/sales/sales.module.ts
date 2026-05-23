import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './controllers/sales.controller';
import { SalesService } from './services/sales.service';
import { SalesRepository } from './repositories/sales.repository';
import { Sale } from './entities/sale.entity';
import { SALES_REPOSITORY } from './interfaces/sales-repository.interface';

@Module({
  imports:     [TypeOrmModule.forFeature([Sale])],
  controllers: [SalesController],
  providers:   [SalesService, { provide: SALES_REPOSITORY, useClass: SalesRepository }],
  exports:     [SalesService],
})
export class SalesModule {}
