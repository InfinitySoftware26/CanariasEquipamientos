import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProductsRepository, PRODUCTS_REPOSITORY } from '../interfaces/products-repository.interface';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY) private readonly productsRepo: IProductsRepository,
  ) {}

  findAll(societyId: string): Promise<Product[]> {
    return this.productsRepo.findAll(societyId);
  }

  /**
   * societyId opcional: si se pasa, un registro de otra sociedad responde 404
   * (no 403) para no revelar su existencia. Ver common/utils/society-scope.util.
   */
  async findById(id: string, societyId?: string): Promise<Product> {
    const product = await this.productsRepo.findById(id, societyId);
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    return product;
  }

  create(dto: CreateProductDto, societyId: string): Promise<Product> {
    return this.productsRepo.create({ ...dto, societyId });
  }

  async update(id: string, dto: UpdateProductDto, societyId?: string): Promise<Product> {
    await this.findById(id, societyId);
    return this.productsRepo.update(id, dto);
  }

  async deactivate(id: string, societyId?: string): Promise<void> {
    await this.findById(id, societyId);
    await this.productsRepo.softDelete(id);
  }
}
