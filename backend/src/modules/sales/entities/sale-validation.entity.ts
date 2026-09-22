import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

import { ValidationStep } from "../../../common/enums/validation-step.enum";

import { ValidationStatus } from "../../../common/enums/validation-status.enum";

@Entity("SALE_VALIDATIONS")
export class SaleValidation {
  @PrimaryGeneratedColumn("uuid", {
    name: "validation_id",
  })
  validationId!: string;

  @Column({
    name: "sale_id",
    type: "uuid",
  })
  saleId!: string;

  @Column({
    name: "staff_id",
    type: "uuid",
  })
  staffId!: string;

  @Column({
    type: "enum",
    enum: ValidationStep,
  })
  step!: ValidationStep;

  @Column({
    type: "enum",
    enum: ValidationStatus,
  })
  status!: ValidationStatus;

  @Column({
    type: "text",
    nullable: true,
  })
  observations!: string | null;

  // ============================================================
  // DOCUMENTACIÓN RECIBIDA DURANTE LA VISITA AMBIENTAL
  // ============================================================

  @Column({
    name: "dni_copy_received",
    type: "boolean",
    nullable: true,
  })
  dniCopyReceived!: boolean | null;

  @Column({
    name: "salary_receipt_received",
    type: "boolean",
    nullable: true,
  })
  salaryReceiptReceived!: boolean | null;

  @Column({
    name: "other_documents_received",
    type: "boolean",
    nullable: true,
  })
  otherDocumentsReceived!: boolean | null;

  @Column({
    name: "validated_at",
    type: "timestamptz",
  })
  validatedAt!: Date;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;
}
