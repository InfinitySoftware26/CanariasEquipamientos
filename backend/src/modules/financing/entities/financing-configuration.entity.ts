import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Product } from "../../products/entities/product.entity";

/**
 * FinancingConfiguration
 *
 * Define una tasa de financiación base que se puede aplicar:
 * - Globalmente a todos los productos de una sociedad (isGlobal = true)
 * - A productos específicos (isGlobal = false + M2M relationship)
 *
 * Las cuotas y frecuencias de pago se definen en FinancingPlan.
 * Las ganancias adicionales se definen en Promotion.
 *
 * Ejemplo:
 *   Financiación Base "Estándar": 12% tasa → aplica a todos los productos de la sociedad
 *   Financiación Base "Premium": 8% tasa → aplica solo a TV, Laptop, etc.
 */
@Entity("FINANCING_CONFIGURATIONS")
export class FinancingConfiguration {
  @PrimaryGeneratedColumn("uuid", { name: "financing_config_id" })
  financingConfigId!: string;

  @Column({ name: "society_id", type: "uuid" })
  societyId!: string;

  @Column({ name: "name", type: "varchar", length: 150 })
  name!: string;

  @Column({
    name: "financing_rate",
    type: "decimal",
    precision: 5,
    scale: 4,
    comment: "Tasa de financiación base (ej: 0.12 = 12%)",
  })
  financingRate!: number;

  @Column({ name: "is_global", default: true })
  isGlobal!: boolean;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @ManyToMany(() => Product)
  @JoinTable({
    name: "FINANCING_CONFIG_PRODUCTS",
    joinColumn: {
      name: "financing_config_id",
      referencedColumnName: "financingConfigId",
    },
    inverseJoinColumn: {
      name: "product_id",
      referencedColumnName: "productId",
    },
  })
  products!: Product[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
