import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { FinancingPlan } from "./financing-plan.entity";
import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";

@Entity("PROMOTIONS")
export class Promotion {
  @PrimaryGeneratedColumn("uuid", { name: "promotion_id" })
  promotionId!: string;

  @Column({ name: "society_id", type: "uuid" })
  societyId!: string;

  @Column({ name: "name", type: "varchar", length: 150 })
  name!: string;

  @Column({
    name: "financing_plan_id",
    type: "uuid",
    nullable: true,
  })
  financingPlanId!: string | null;

  @ManyToOne(() => FinancingPlan, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({
    name: "financing_plan_id",
    referencedColumnName: "financingPlanId",
  })
  plan!: FinancingPlan | null;

  @Column({
    name: "discount_percentage",
    type: "decimal",
    precision: 5,
    scale: 4,
    nullable: true,
    comment: "Ajuste sobre la tasa base: negativo = descuento al cliente, positivo = recargo",
  })
  discountPercentage!: number | null;

  @Column({
    name: "payment_frequency",
    type: "enum",
    enum: PaymentFrequency,
    enumName: "payment_frequency_enum",
    nullable: true,
  })
  paymentFrequency!: PaymentFrequency | null;

  @Column({
    name: "installments_count",
    type: "integer",
    nullable: true,
  })
  installmentsCount!: number | null;

  @Column({ name: "is_global", default: false })
  isGlobal!: boolean;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @ManyToMany(() => Product)
  @JoinTable({
    name: "PROMOTION_PRODUCTS",
    joinColumn: {
      name: "promotion_id",
      referencedColumnName: "promotionId",
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
