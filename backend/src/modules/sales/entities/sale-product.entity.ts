import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Sale } from './sale.entity';

@Entity('SALE_PRODUCTS')
export class SaleProduct {
  @PrimaryGeneratedColumn('uuid', { name: 'sale_product_id' })
  saleProductId!: string;

  @Column({ name: 'sale_id' })
  saleId!: string;

  @ManyToOne(() => Sale, sale => sale.products)
  @JoinColumn({ name: 'sale_id' })
  sale!: Sale;

  @Column({ name: 'product_id' })
  productId!: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
