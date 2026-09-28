import { MigrationInterface, QueryRunner } from "typeorm";

export class ClientSurveyFieldsSchema20260816000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── CAMPOS SOCIOECONÓMICOS DEL CLIENTE ──────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "CLIENT"
        ADD COLUMN IF NOT EXISTS "profession" text,
        ADD COLUMN IF NOT EXISTS "monthly_income" text,
        ADD COLUMN IF NOT EXISTS "payment_method" text,
        ADD COLUMN IF NOT EXISTS "income_dependents" text,
        ADD COLUMN IF NOT EXISTS "additional_income" text,
        ADD COLUMN IF NOT EXISTS "housing_situation" text,
        ADD COLUMN IF NOT EXISTS "contract_duration" text,
        ADD COLUMN IF NOT EXISTS "cuil" text,
        ADD COLUMN IF NOT EXISTS "active_credit" boolean NOT NULL DEFAULT false;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "CLIENT"
        DROP COLUMN IF EXISTS "profession",
        DROP COLUMN IF EXISTS "monthly_income",
        DROP COLUMN IF EXISTS "payment_method",
        DROP COLUMN IF EXISTS "income_dependents",
        DROP COLUMN IF EXISTS "additional_income",
        DROP COLUMN IF EXISTS "housing_situation",
        DROP COLUMN IF EXISTS "contract_duration",
        DROP COLUMN IF EXISTS "cuil",
        DROP COLUMN IF EXISTS "active_credit";
    `);
  }
}
