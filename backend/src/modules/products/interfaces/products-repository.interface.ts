import { Product } from '../entities/product.entity';

export interface IProductsRepository {
  findAll(societyId: string): Promise<Product[]>;
  /** societyId opcional: si se pasa, filtra por sociedad en la consulta. */
  findById(id: string, societyId?: string): Promise<Product | null>;
  create(data: Partial<Product>): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  softDelete(id: string): Promise<void>;
}

export const PRODUCTS_REPOSITORY = 'IProductsRepository';
