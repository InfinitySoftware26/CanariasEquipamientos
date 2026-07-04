import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('FINANCING_CONFIGURATIONS')
export class FinancingConfiguration {
  @PrimaryGeneratedColumn('uuid', { name: 'financing_config_id' })
  financingConfigId!: string;

  @Column({ name: 'society_id', type: 'uuid' })
  societyId!: string;

  @Column({ name: 'installments_3_rate', type: 'decimal', precision: 5, scale: 4, default: 0.15 })
  installments3Rate!: number;

  @Column({ name: 'installments_6_rate', type: 'decimal', precision: 5, scale: 4, default: 0.25 })
  installments6Rate!: number;

  @Column({ name: 'installments_9_rate', type: 'decimal', precision: 5, scale: 4, default: 0.35 })
  installments9Rate!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId!: string | null;

  @Column({ name: 'is_global', default: true })
  isGlobal!: boolean;

  @Column({ name: 'max_installments', type: 'integer', default: 9 })
  maxInstallments!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
