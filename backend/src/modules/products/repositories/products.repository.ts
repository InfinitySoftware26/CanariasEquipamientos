import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { IProductsRepository } from '../interfaces/products-repository.interface';
import { ProductStatus } from '../../../common/enums/product-status.enum';

@Injectable()
export class ProductsRepository implements IProductsRepository {
  constructor(@InjectRepository(Product) private readonly repo: Repository<Product>) {}

  findAll(societyId: string): Promise<Product[]> {
    return this.repo.find({
      where: { societyId, status: ProductStatus.ACTIVE },
      order: { name: 'ASC' },
    });
  }

  findById(id: string): Promise<Product | null> {
    return this.repo.findOne({ where: { productId: id } });
  }

  async create(data: Partial<Product>): Promise<Product> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    await this.repo.update({ productId: id }, data);
    return this.repo.findOneOrFail({ where: { productId: id } });
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.update({ productId: id }, { status: ProductStatus.INACTIVE });
  }
}
