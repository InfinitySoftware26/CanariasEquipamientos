import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("CLIENT_HISTORY")
export class ClientHistory {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column({ name: "client_id", type: "uuid" })
  clientId!: string;

  @Column({ type: "jsonb" })
  snapshot!: any;

  @Column({ name: "action" })
  action!: string;

  @Column({ name: "performed_by", type: "uuid" })
  performedBy!: string;

  @Column({ name: "performed_by_name" })
  performedByName!: string;

  @CreateDateColumn({ name: "performed_at" })
  performedAt!: Date;
}
