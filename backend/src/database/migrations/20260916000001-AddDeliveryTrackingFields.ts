import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeliveryTrackingFields20260916000001 implements MigrationInterface {
  name = "AddDeliveryTrackingFields20260916000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================================
    // SALES
    // ============================================================

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

    // ============================================================
    // FOREIGN KEY → STAFF
    // ============================================================

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

    // ============================================================
    // ROUTE_SHEET_ITEMS
    // ============================================================

    await queryRunner.query(`
      ALTER TABLE "ROUTE_SHEET_ITEMS"
      ADD COLUMN IF NOT EXISTS "product_delivered"
      boolean NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "ROUTE_SHEET_ITEMS"
      ADD COLUMN IF NOT EXISTS "payment_received"
      boolean NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ============================================================
    // ROUTE_SHEET_ITEMS
    // ============================================================

    await queryRunner.query(`
      ALTER TABLE "ROUTE_SHEET_ITEMS"
      DROP COLUMN IF EXISTS "payment_received"
    `);

    await queryRunner.query(`
      ALTER TABLE "ROUTE_SHEET_ITEMS"
      DROP COLUMN IF EXISTS "product_delivered"
    `);

    // ============================================================
    // SALES
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
}
