import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sprint03Schema20260703000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ─── ROUTE_SHEETS ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'route_sheet_status_enum') THEN
          CREATE TYPE route_sheet_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ROUTE_SHEETS" (
        route_sheet_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        society_id     uuid NOT NULL,
        zone_id        uuid NOT NULL,
        staff_id       uuid NOT NULL,
        assigned_by    uuid NOT NULL,
        route_date     date NOT NULL,
        status         route_sheet_status_enum NOT NULL DEFAULT 'pending',
        notes          text,
        created_at     timestamptz NOT NULL DEFAULT NOW(),
        updated_at     timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_route_sheets_society   ON "ROUTE_SHEETS" (society_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_route_sheets_zone      ON "ROUTE_SHEETS" (zone_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_route_sheets_staff     ON "ROUTE_SHEETS" (staff_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_route_sheets_route_date ON "ROUTE_SHEETS" (route_date);`);

    // ─── ROUTE_SHEET_ITEMS ────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'route_sheet_item_type_enum') THEN
          CREATE TYPE route_sheet_item_type_enum AS ENUM ('installment', 'delivery');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'route_sheet_item_result_enum') THEN
          CREATE TYPE route_sheet_item_result_enum AS ENUM ('pending', 'completed', 'failed', 'rescheduled');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ROUTE_SHEET_ITEMS" (
        item_id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        route_sheet_id   uuid NOT NULL,
        client_id        uuid NOT NULL,
        installment_id   uuid,
        sale_id          uuid,
        item_type        route_sheet_item_type_enum NOT NULL,
        result           route_sheet_item_result_enum NOT NULL DEFAULT 'pending',
        collected_amount numeric(12,2),
        notes            text,
        visited_at       timestamptz,
        created_at       timestamptz NOT NULL DEFAULT NOW(),
        updated_at       timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_route_sheet_items_route_sheet ON "ROUTE_SHEET_ITEMS" (route_sheet_id);`);

    // ─── DAILY_CLOSURES ───────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'daily_closure_status_enum') THEN
          CREATE TYPE daily_closure_status_enum AS ENUM ('pending', 'validated', 'rejected');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "DAILY_CLOSURES" (
        closure_id      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        staff_id        uuid NOT NULL,
        validated_by    uuid,
        society_id      uuid NOT NULL,
        closing_date    date NOT NULL,
        total_collected numeric(12,2) NOT NULL,
        status          daily_closure_status_enum NOT NULL DEFAULT 'pending',
        notes           text,
        created_at      timestamptz NOT NULL DEFAULT NOW(),
        updated_at      timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_daily_closures_staff   ON "DAILY_CLOSURES" (staff_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_daily_closures_society ON "DAILY_CLOSURES" (society_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_daily_closures_closing_date ON "DAILY_CLOSURES" (closing_date);`);

    // ─── SETTLEMENTS ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'settlement_status_enum') THEN
          CREATE TYPE settlement_status_enum AS ENUM ('pending', 'validated', 'rejected');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "SETTLEMENTS" (
        settlement_id    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        closure_id       uuid NOT NULL,
        staff_id         uuid NOT NULL,
        society_id       uuid NOT NULL,
        settlement_date  date NOT NULL,
        amount_due       numeric(12,2) NOT NULL,
        amount_collected numeric(12,2) NOT NULL,
        outstanding_debt numeric(12,2) NOT NULL,
        status           settlement_status_enum NOT NULL DEFAULT 'pending',
        notes            text,
        created_at       timestamptz NOT NULL DEFAULT NOW(),
        updated_at       timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_settlements_closure ON "SETTLEMENTS" (closure_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_settlements_staff   ON "SETTLEMENTS" (staff_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_settlements_society ON "SETTLEMENTS" (society_id);`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_settlements_closure ON "SETTLEMENTS" (closure_id);`);

    // ─── FINANCING_CONFIGURATIONS — per-product overrides ────────────────────
    await queryRunner.query(`
      ALTER TABLE "FINANCING_CONFIGURATIONS"
        ADD COLUMN IF NOT EXISTS product_id uuid,
        ADD COLUMN IF NOT EXISTS is_global boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS max_installments integer NOT NULL DEFAULT 9;
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_financing_config_product
        ON "FINANCING_CONFIGURATIONS" (product_id) WHERE product_id IS NOT NULL;
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_financing_config_product ON "FINANCING_CONFIGURATIONS" (product_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS uq_financing_config_product;`);
    await queryRunner.query(`
      ALTER TABLE "FINANCING_CONFIGURATIONS"
        DROP COLUMN IF EXISTS product_id,
        DROP COLUMN IF EXISTS is_global,
        DROP COLUMN IF EXISTS max_installments;
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "SETTLEMENTS";`);
    await queryRunner.query(`DROP TYPE IF EXISTS settlement_status_enum;`);

    await queryRunner.query(`DROP TABLE IF EXISTS "DAILY_CLOSURES";`);
    await queryRunner.query(`DROP TYPE IF EXISTS daily_closure_status_enum;`);

    await queryRunner.query(`DROP TABLE IF EXISTS "ROUTE_SHEET_ITEMS";`);
    await queryRunner.query(`DROP TYPE IF EXISTS route_sheet_item_result_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS route_sheet_item_type_enum;`);

    await queryRunner.query(`DROP TABLE IF EXISTS "ROUTE_SHEETS";`);
    await queryRunner.query(`DROP TYPE IF EXISTS route_sheet_status_enum;`);
  }
}
