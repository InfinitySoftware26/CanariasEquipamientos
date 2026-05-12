import { Module } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsRepository } from './receipts.repository';

@Module({
  providers: [ReceiptsService, ReceiptsRepository],
  controllers: [ReceiptsController],
})
export class ReceiptsModule {}
