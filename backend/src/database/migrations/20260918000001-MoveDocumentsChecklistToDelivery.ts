import { MigrationInterface, QueryRunner } from "typeorm";

export class MoveDocumentsChecklistToDelivery20260918000001 implements MigrationInterface {
  name = "MoveDocumentsChecklistToDelivery20260918000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================================
    // SALE_VALIDATIONS: checklist de la entrega
    // dni_copy_received se conserva
    // ============================================================

    await queryRunner.query(`
      ALTER TABLE "SALE_VALIDATIONS"
      DROP COLUMN IF EXISTS "salary_receipt_received"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALE_VALIDATIONS"
      DROP COLUMN IF EXISTS "other_documents_received"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALE_VALIDATIONS"
      ADD COLUMN IF NOT EXISTS "contract_received"
      boolean NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "SALE_VALIDATIONS"
      ADD COLUMN IF NOT EXISTS "utility_bill_received"
      boolean NULL
    `);

    // ============================================================
    // SALES: se elimina el registro redundante
    // ============================================================

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP CONSTRAINT IF EXISTS "FK_sales_collector_documents_delivered_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN IF EXISTS "collector_documents_delivered_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN IF EXISTS "collector_documents_delivered_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN IF EXISTS "collector_documents_delivered"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN IF NOT EXISTS "collector_documents_delivered"
      boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN IF NOT EXISTS "collector_documents_delivered_at"
      TIMESTAMP WITH TIME ZONE NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN IF NOT EXISTS "collector_documents_delivered_by"
      uuid NULL
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_sales_collector_documents_delivered_by'
        ) THEN
          ALTER TABLE "SALES"
          ADD CONSTRAINT "FK_sales_collector_documents_delivered_by"
          FOREIGN KEY ("collector_documents_delivered_by")
          REFERENCES "STAFF"("staff_id")
          ON DELETE SET NULL
          ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "SALE_VALIDATIONS"
      DROP COLUMN IF EXISTS "utility_bill_received"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALE_VALIDATIONS"
      DROP COLUMN IF EXISTS "contract_received"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALE_VALIDATIONS"
      ADD COLUMN IF NOT EXISTS "salary_receipt_received"
      boolean NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "SALE_VALIDATIONS"
      ADD COLUMN IF NOT EXISTS "other_documents_received"
      boolean NULL
    `);
  }
}
