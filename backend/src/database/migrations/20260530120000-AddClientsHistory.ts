import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClientsHistory20260530120000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid_generate_v4 is available (extension usually present)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Add columns to CLIENT table if not present
    await queryRunner.query(`
      ALTER TABLE "CLIENT"
        ADD COLUMN IF NOT EXISTS "support_dni" boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS "support_bill" boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS "support_visit" boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS "visit_name" varchar,
        ADD COLUMN IF NOT EXISTS "visit_date" timestamptz,
        ADD COLUMN IF NOT EXISTS "observations" text,
        ADD COLUMN IF NOT EXISTS "society_id" uuid,
        ADD COLUMN IF NOT EXISTS "created_by" uuid,
        ADD COLUMN IF NOT EXISTS "updated_by" uuid,
        ADD COLUMN IF NOT EXISTS "verification_requested_by" uuid,
        ADD COLUMN IF NOT EXISTS "verification_requested_by_name" varchar,
        ADD COLUMN IF NOT EXISTS "verification_requested_at" timestamptz,
        ADD COLUMN IF NOT EXISTS "verification_note" text;
    `);

    // Add indexes for frequent filters
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_client_society ON "CLIENT" ("society_id");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_client_document_number ON "CLIENT" ("document_number");`
    );

    // Create CLIENT_HISTORY table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "CLIENT_HISTORY" (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id uuid NOT NULL,
        snapshot jsonb NOT NULL,
        action varchar NOT NULL,
        performed_by uuid NOT NULL,
        performed_by_name varchar NOT NULL,
        performed_at timestamptz NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_client_history_client_id ON "CLIENT_HISTORY" ("client_id");`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_client_history_client_id`
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "CLIENT_HISTORY"`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_client_document_number`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_client_society`);

    // Remove columns added (IF EXISTS)
    await queryRunner.query(`
      ALTER TABLE "CLIENT"
        DROP COLUMN IF EXISTS "verification_note",
        DROP COLUMN IF EXISTS "verification_requested_at",
        DROP COLUMN IF EXISTS "verification_requested_by_name",
        DROP COLUMN IF EXISTS "verification_requested_by",
        DROP COLUMN IF EXISTS "updated_by",
        DROP COLUMN IF EXISTS "created_by",
        DROP COLUMN IF EXISTS "society_id",
        DROP COLUMN IF EXISTS "observations",
        DROP COLUMN IF EXISTS "visit_date",
        DROP COLUMN IF EXISTS "visit_name",
        DROP COLUMN IF EXISTS "support_visit",
        DROP COLUMN IF EXISTS "support_bill",
        DROP COLUMN IF EXISTS "support_dni";
    `);
  }
}
