import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("SALE_HISTORY")
export class SaleHistory {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column({ name: "sale_id", type: "uuid" })
  saleId!: string;

  @Column()
  action!: string;

  @Column({ type: "jsonb" })
  snapshot!: any;

  @Column({ name: "performed_by" })
  performedBy!: string;

  @Column({ name: "performed_by_name" })
  performedByName!: string;

  @CreateDateColumn({ name: "performed_at" })
  performedAt!: Date;
}
