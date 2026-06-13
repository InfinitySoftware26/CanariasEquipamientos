import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sprint02Schema20260610000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ─── ZONES ────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'zone_status_enum') THEN
          CREATE TYPE zone_status_enum AS ENUM ('active', 'inactive');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ZONES" (
        zone_id        uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        society_id     uuid NOT NULL,
        name           varchar NOT NULL,
        description    varchar,
        status         zone_status_enum NOT NULL DEFAULT 'active',
        created_at     timestamptz NOT NULL DEFAULT NOW(),
        updated_at     timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_zones_society ON "ZONES" (society_id);`);

    // ─── STAFF_ZONES ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_zone_status_enum') THEN
          CREATE TYPE staff_zone_status_enum AS ENUM ('active', 'inactive');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "STAFF_ZONES" (
        staff_zone_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        staff_id      uuid NOT NULL,
        zone_id       uuid NOT NULL,
        status        staff_zone_status_enum NOT NULL DEFAULT 'active',
        assigned_at   timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_staff_zones_staff ON "STAFF_ZONES" (staff_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_staff_zones_zone  ON "STAFF_ZONES" (zone_id);`);

    // ─── STAFF_SOCIETIES ──────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_society_status_enum') THEN
          CREATE TYPE staff_society_status_enum AS ENUM ('active', 'inactive');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "STAFF_SOCIETIES" (
        staff_society_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        staff_id         uuid NOT NULL,
        society_id       uuid NOT NULL,
        status           staff_society_status_enum NOT NULL DEFAULT 'active',
        assigned_at      timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_staff_societies_staff   ON "STAFF_SOCIETIES" (staff_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_staff_societies_society ON "STAFF_SOCIETIES" (society_id);`);

    // ─── CLIENT — add zone_id ─────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "CLIENT" ADD COLUMN IF NOT EXISTS zone_id uuid;
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_client_zone ON "CLIENT" (zone_id);`);

    // ─── PRODUCTS ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status_enum') THEN
          CREATE TYPE product_status_enum AS ENUM ('active', 'inactive');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "PRODUCTS" (
        product_id  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name        varchar NOT NULL,
        brand       varchar NOT NULL,
        model       varchar NOT NULL,
        category    varchar,
        description varchar,
        price       numeric(12,2) NOT NULL,
        cost_price  numeric(12,2),
        society_id  uuid,
        status      product_status_enum NOT NULL DEFAULT 'active',
        created_at  timestamptz NOT NULL DEFAULT NOW(),
        updated_at  timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_society ON "PRODUCTS" (society_id);`);

    // ─── FINANCING_CONFIGURATIONS ─────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "FINANCING_CONFIGURATIONS" (
        financing_config_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        society_id          uuid NOT NULL,
        installments_3_rate numeric(5,4) NOT NULL DEFAULT 0.15,
        installments_6_rate numeric(5,4) NOT NULL DEFAULT 0.25,
        installments_9_rate numeric(5,4) NOT NULL DEFAULT 0.35,
        is_active           boolean NOT NULL DEFAULT true,
        created_at          timestamptz NOT NULL DEFAULT NOW(),
        updated_at          timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_financing_config_society ON "FINANCING_CONFIGURATIONS" (society_id);`);

    // ─── SALES — update status enum & add new columns ─────────────────────────
    await queryRunner.query(`ALTER TABLE "SALES" ALTER COLUMN status DROP DEFAULT;`);
    await queryRunner.query(`ALTER TABLE "SALES" ALTER COLUMN status TYPE text;`);
    await queryRunner.query(`DROP TYPE IF EXISTS sale_status_enum;`);
    await queryRunner.query(`
      CREATE TYPE sale_status_enum AS ENUM (
        'pending_admin_validation',
        'rejected_admin',
        'pending_environmental_visit',
        'environmental_rejected',
        'pending_delivery',
        'delivered',
        'closed'
      );
    `);
    await queryRunner.query(`
      ALTER TABLE "SALES"
        ALTER COLUMN status TYPE sale_status_enum
        USING 'pending_admin_validation'::sale_status_enum;
    `);
    await queryRunner.query(`ALTER TABLE "SALES" ALTER COLUMN status SET DEFAULT 'pending_admin_validation';`);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_frequency_enum') THEN
          CREATE TYPE payment_frequency_enum AS ENUM ('weekly', 'monthly');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      ALTER TABLE "SALES"
        ADD COLUMN IF NOT EXISTS installment_amount   numeric(12,2),
        ADD COLUMN IF NOT EXISTS installments_count   integer,
        ADD COLUMN IF NOT EXISTS payment_frequency    payment_frequency_enum,
        ADD COLUMN IF NOT EXISTS first_due_date       date,
        ADD COLUMN IF NOT EXISTS assigned_collector_id uuid;
    `);
    await queryRunner.query(`
      ALTER TABLE "SALES"
        DROP COLUMN IF EXISTS payment_type,
        DROP COLUMN IF EXISTS total_amount;
    `);
    await queryRunner.query(`
      ALTER TABLE "SALES"
        ADD COLUMN IF NOT EXISTS total_amount numeric(12,2);
    `);

    // ─── SALE_PRODUCTS ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "SALE_PRODUCTS" (
        sale_product_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        sale_id         uuid NOT NULL,
        product_id      uuid NOT NULL,
        quantity        integer NOT NULL,
        unit_price      numeric(12,2) NOT NULL,
        subtotal        numeric(12,2) NOT NULL,
        created_at      timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_sale_products_sale ON "SALE_PRODUCTS" (sale_id);`);

    // ─── SALE_VALIDATIONS ─────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'validation_step_enum') THEN
          CREATE TYPE validation_step_enum AS ENUM ('admin_validation','environmental_visit','delivery');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'validation_status_enum') THEN
          CREATE TYPE validation_status_enum AS ENUM ('pending','approved','rejected');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "SALE_VALIDATIONS" (
        validation_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        sale_id       uuid NOT NULL,
        staff_id      uuid NOT NULL,
        step          validation_step_enum NOT NULL,
        status        validation_status_enum NOT NULL,
        observations  text,
        validated_at  timestamptz NOT NULL,
        created_at    timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_sale_validations_sale ON "SALE_VALIDATIONS" (sale_id);`);

    // ─── DELIVERY_ATTEMPTS ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "DELIVERY_ATTEMPTS" (
        delivery_attempt_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        sale_id             uuid NOT NULL,
        staff_id            uuid NOT NULL,
        attempt_number      integer NOT NULL,
        reason              text NOT NULL,
        attempted_at        timestamptz NOT NULL,
        created_at          timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_delivery_attempts_sale ON "DELIVERY_ATTEMPTS" (sale_id);`);

    // ─── INSTALLMENTS ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'installment_status_enum') THEN
          CREATE TYPE installment_status_enum AS ENUM ('pending','paid','overdue','partial','defaulted');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "INSTALLMENTS" (
        installment_id     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        sale_id            uuid NOT NULL,
        client_id          uuid NOT NULL,
        society_id         uuid NOT NULL,
        installment_number integer NOT NULL,
        amount             numeric(12,2) NOT NULL,
        paid_amount        numeric(12,2) NOT NULL DEFAULT 0,
        remaining_amount   numeric(12,2) NOT NULL,
        due_date           date NOT NULL,
        payment_frequency  payment_frequency_enum NOT NULL,
        status             installment_status_enum NOT NULL DEFAULT 'pending',
        notes              varchar,
        created_at         timestamptz NOT NULL DEFAULT NOW(),
        updated_at         timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_installments_sale      ON "INSTALLMENTS" (sale_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_installments_client    ON "INSTALLMENTS" (client_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_installments_society   ON "INSTALLMENTS" (society_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_installments_due_date  ON "INSTALLMENTS" (due_date);`);

    // ─── SALE_HISTORY ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "SALE_HISTORY" (
        id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        sale_id          uuid NOT NULL,
        action           varchar NOT NULL,
        snapshot         jsonb NOT NULL,
        performed_by     uuid NOT NULL,
        performed_by_name varchar NOT NULL,
        performed_at     timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_sale_history_sale ON "SALE_HISTORY" (sale_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "SALE_HISTORY";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "INSTALLMENTS";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "DELIVERY_ATTEMPTS";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "SALE_VALIDATIONS";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "SALE_PRODUCTS";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "FINANCING_CONFIGURATIONS";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "PRODUCTS";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "STAFF_SOCIETIES";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "STAFF_ZONES";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ZONES";`);
    await queryRunner.query(`ALTER TABLE "CLIENT" DROP COLUMN IF EXISTS zone_id;`);
    await queryRunner.query(`DROP TYPE IF EXISTS installment_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS validation_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS validation_step_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_frequency_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS sale_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS product_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS staff_society_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS staff_zone_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS zone_status_enum;`);
  }
}
