import { Module } from '@nestjs/common';
import { SalesproductsService } from './salesproducts.service';
import { SalesproductsController } from './salesproducts.controller';

@Module({
  providers: [SalesproductsService],
  controllers: [SalesproductsController],
})
export class SalesproductsModule {}
