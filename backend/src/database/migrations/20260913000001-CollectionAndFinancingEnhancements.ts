import { MigrationInterface, QueryRunner } from "typeorm";

export class CollectionAndFinancingEnhancements20260913000001 implements MigrationInterface {
  name = "CollectionAndFinancingEnhancements20260913000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─────────────────────────────────────────
    // ENUM DE PLANIFICACIÓN DE COBRANZA
    // ─────────────────────────────────────────

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "collection_schedule_type_enum"
        AS ENUM (
          'fixed_weekday',
          'monthly_range'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // ─────────────────────────────────────────
    // SALES
    // ─────────────────────────────────────────

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN IF NOT EXISTS
      "financing_plan_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN IF NOT EXISTS
      "promotion_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN IF NOT EXISTS
      "collection_schedule_type"
      "collection_schedule_type_enum"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN IF NOT EXISTS
      "collection_weekday" smallint
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN IF NOT EXISTS
      "payment_range_start_day" smallint
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN IF NOT EXISTS
      "payment_range_end_day" smallint
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN IF NOT EXISTS
      "manual_collection_date" date
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN IF NOT EXISTS
      "first_installment_on_delivery"
      boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN IF NOT EXISTS
      "second_due_date" date
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN IF NOT EXISTS
      "daily_late_interest_rate"
      numeric(7,6)
      NOT NULL DEFAULT 0
    `);

    // ─────────────────────────────────────────
    // SALE PRODUCTS
    // ─────────────────────────────────────────

    await queryRunner.query(`
      ALTER TABLE "SALE_PRODUCTS"
      ADD COLUMN IF NOT EXISTS
      "custom_details" jsonb
    `);

    // ─────────────────────────────────────────
    // RETIROS DE PRODUCTO
    // ─────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS
      "PRODUCT_REPOSSESSIONS" (
        "repossession_id"
          uuid
          PRIMARY KEY
          DEFAULT gen_random_uuid(),

        "society_id"
          uuid
          NOT NULL,

        "sale_id"
          uuid
          NOT NULL,

        "client_id"
          uuid
          NOT NULL,

        "registered_by"
          uuid
          NOT NULL,

        "cancelled_street_amount"
          numeric(12,2)
          NOT NULL,

        "notes"
          text,

        "created_at"
          timestamptz
          NOT NULL
          DEFAULT now(),

        CONSTRAINT
          "UQ_product_repossession_sale"
          UNIQUE ("sale_id")
      )
    `);

    // ─────────────────────────────────────────
    // CIERRES MENSUALES
    // ─────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS
      "MONTHLY_CLOSURES" (
        "monthly_closure_id"
          uuid
          PRIMARY KEY
          DEFAULT gen_random_uuid(),

        "society_id"
          uuid
          NOT NULL,

        "year"
          integer
          NOT NULL,

        "month"
          integer
          NOT NULL,

        "total_collected"
          numeric(14,2)
          NOT NULL,

        "daily_closures_count"
          integer
          NOT NULL,

        "closed_by"
          uuid
          NOT NULL,

        "closed_at"
          timestamptz
          NOT NULL
          DEFAULT now(),

        CONSTRAINT
          "UQ_monthly_closure_period"
          UNIQUE (
            "society_id",
            "year",
            "month"
          )
      )
    `);

    // ─────────────────────────────────────────
    // VALIDACIONES
    // ─────────────────────────────────────────

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP CONSTRAINT IF EXISTS
      "CHK_sales_collection_weekday"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD CONSTRAINT
      "CHK_sales_collection_weekday"
      CHECK (
        collection_weekday IS NULL
        OR collection_weekday BETWEEN 0 AND 6
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP CONSTRAINT IF EXISTS
      "CHK_sales_payment_range"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD CONSTRAINT
      "CHK_sales_payment_range"
      CHECK (
        (
          payment_range_start_day IS NULL
          AND payment_range_end_day IS NULL
        )
        OR
        (
          payment_range_start_day
            BETWEEN 1 AND 31
          AND payment_range_end_day
            BETWEEN 1 AND 31
          AND payment_range_start_day
            <= payment_range_end_day
        )
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS
      "MONTHLY_CLOSURES"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS
      "PRODUCT_REPOSSESSIONS"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALE_PRODUCTS"
      DROP COLUMN IF EXISTS
      "custom_details"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP CONSTRAINT IF EXISTS
      "CHK_sales_payment_range"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP CONSTRAINT IF EXISTS
      "CHK_sales_collection_weekday"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN IF EXISTS
      "daily_late_interest_rate"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN IF EXISTS
      "second_due_date"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN IF EXISTS
      "first_installment_on_delivery"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN IF EXISTS
      "manual_collection_date"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN IF EXISTS
      "payment_range_end_day"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN IF EXISTS
      "payment_range_start_day"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN IF EXISTS
      "collection_weekday"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN IF EXISTS
      "collection_schedule_type"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN IF EXISTS
      "promotion_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN IF EXISTS
      "financing_plan_id"
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS
      "collection_schedule_type_enum"
    `);
  }
}
