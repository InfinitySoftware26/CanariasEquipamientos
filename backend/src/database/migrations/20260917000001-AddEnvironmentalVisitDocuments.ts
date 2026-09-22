import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEnvironmentalVisitDocuments20260917000001 implements MigrationInterface {
  name = "AddEnvironmentalVisitDocuments20260917000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SALE_VALIDATIONS"
      ADD COLUMN IF NOT EXISTS "dni_copy_received"
      boolean NULL
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SALE_VALIDATIONS"
      DROP COLUMN IF EXISTS "other_documents_received"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALE_VALIDATIONS"
      DROP COLUMN IF EXISTS "salary_receipt_received"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALE_VALIDATIONS"
      DROP COLUMN IF EXISTS "dni_copy_received"
    `);
  }
}
