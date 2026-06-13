import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { ProductStatus } from '../../../common/enums/product-status.enum';

@Entity('PRODUCTS')
export class Product {
  @PrimaryGeneratedColumn('uuid', { name: 'product_id' })
  productId!: string;

  @Column()
  name!: string;

  @Column()
  brand!: string;

  @Column()
  model!: string;

  @Column({ nullable: true })
  category!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ name: 'price', type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  costPrice!: number;

  @Column({ name: 'society_id', nullable: true })
  societyId!: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status!: ProductStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
