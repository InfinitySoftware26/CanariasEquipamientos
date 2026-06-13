import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { ProductsRepository } from './repositories/products.repository';
import { Product } from './entities/product.entity';
import { PRODUCTS_REPOSITORY } from './interfaces/products-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    { provide: PRODUCTS_REPOSITORY, useClass: ProductsRepository },
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
