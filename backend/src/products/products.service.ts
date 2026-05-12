import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/createProductDto';
import { UpdateProductDto } from './dto/updateProductDto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}
  findAll() {
    return this.productsRepository.findAll();
  }

  findOne(id: string) {
    const numericId = Number(id); // 👈 convierte el string a number
    return this.productsRepository.findOne(numericId);
  }
  create(product: CreateProductDto) {
    return this.productsRepository.create(product);
  }
  update(id: string, product: UpdateProductDto) {
    return this.productsRepository.update(id, product);
  }
  remove(id: string) {
    return this.productsRepository.remove(id);
  }
}
