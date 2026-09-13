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
  OneToMany,
} from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { FinancingConfiguration } from "./financing-configuration.entity";
import { Promotion } from "./promotion.entity";
import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";

@Entity("FINANCING_PLANS")
export class FinancingPlan {
  @PrimaryGeneratedColumn("uuid", { name: "financing_plan_id" })
  financingPlanId!: string;

  @Column({ name: "society_id", type: "uuid" })
  societyId!: string;

  @Column({ name: "name", type: "varchar", length: 150 })
  name!: string;

  @Column({ name: "financing_config_id", type: "uuid" })
  financingConfigId!: string;

  @ManyToOne(() => FinancingConfiguration, { onDelete: "RESTRICT" })
  @JoinColumn({
    name: "financing_config_id",
    referencedColumnName: "financingConfigId",
  })
  financingConfiguration!: FinancingConfiguration;

  @Column({
    name: "payment_frequency",
    type: "enum",
    enum: PaymentFrequency,
    enumName: "payment_frequency_enum",
  })
  paymentFrequency!: PaymentFrequency;

  @Column({ name: "installments_count", type: "integer" })
  installmentsCount!: number;

  @Column({ name: "is_global", default: true })
  isGlobal!: boolean;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @ManyToMany(() => Product)
  @JoinTable({
    name: "FINANCING_PLAN_PRODUCTS",
    joinColumn: {
      name: "financing_plan_id",
      referencedColumnName: "financingPlanId",
    },
    inverseJoinColumn: {
      name: "product_id",
      referencedColumnName: "productId",
    },
  })
  products!: Product[];

  @OneToMany(() => Promotion, (promotion) => promotion.plan)
  promotions!: Promotion[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
