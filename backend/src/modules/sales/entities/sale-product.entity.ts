import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('SALE_PRODUCTS')
export class SaleProduct {
  @PrimaryGeneratedColumn('uuid', { name: 'sale_product_id' })
  saleProductId!: string;

  @Column({ name: 'sale_id' })
  saleId!: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
