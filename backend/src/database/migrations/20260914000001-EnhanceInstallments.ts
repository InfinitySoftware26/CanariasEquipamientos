import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceInstallments20260914000001 implements MigrationInterface {
  name = "EnhanceInstallments20260914000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "INSTALLMENTS"
      ADD COLUMN IF NOT EXISTS
      "daily_late_interest_rate"
      numeric(7,6)
      NOT NULL
      DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "INSTALLMENTS"
      ADD COLUMN IF NOT EXISTS
      "late_interest_amount"
      numeric(12,2)
      NOT NULL
      DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "INSTALLMENTS"
      ADD COLUMN IF NOT EXISTS
      "late_interest_calculated_at"
      date
    `);

    await queryRunner.query(`
      ALTER TABLE "INSTALLMENTS"
      ADD COLUMN IF NOT EXISTS
      "is_refinanced"
      boolean
      NOT NULL
      DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "INSTALLMENTS"
      ADD COLUMN IF NOT EXISTS
      "refinanced_at"
      timestamptz
    `);

    await queryRunner.query(`
      ALTER TABLE "INSTALLMENTS"
      ADD COLUMN IF NOT EXISTS
      "refinancing_group_id"
      uuid
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS
      "IDX_installments_refinancing_group"
      ON "INSTALLMENTS"
      ("refinancing_group_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS
      "IDX_installments_due_date"
      ON "INSTALLMENTS"
      ("due_date")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS
      "IDX_installments_sale_id"
      ON "INSTALLMENTS"
      ("sale_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS
      "IDX_installments_sale_id"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS
      "IDX_installments_due_date"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS
      "IDX_installments_refinancing_group"
    `);

    await queryRunner.query(`
      ALTER TABLE "INSTALLMENTS"
      DROP COLUMN IF EXISTS
      "refinancing_group_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "INSTALLMENTS"
      DROP COLUMN IF EXISTS
      "refinanced_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "INSTALLMENTS"
      DROP COLUMN IF EXISTS
      "is_refinanced"
    `);

    await queryRunner.query(`
      ALTER TABLE "INSTALLMENTS"
      DROP COLUMN IF EXISTS
      "late_interest_calculated_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "INSTALLMENTS"
      DROP COLUMN IF EXISTS
      "late_interest_amount"
    `);

    await queryRunner.query(`
      ALTER TABLE "INSTALLMENTS"
      DROP COLUMN IF EXISTS
      "daily_late_interest_rate"
    `);
  }
}
