import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptsController } from './controllers/receipts.controller';
import { ReceiptsService } from './services/receipts.service';
import { ReceiptsRepository } from './repositories/receipts.repository';
import { Receipt } from './entities/receipt.entity';
import { RECEIPTS_REPOSITORY } from './interfaces/receipts-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Receipt])],
  controllers: [ReceiptsController],
  providers: [
    ReceiptsService,
    { provide: RECEIPTS_REPOSITORY, useClass: ReceiptsRepository },
  ],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
