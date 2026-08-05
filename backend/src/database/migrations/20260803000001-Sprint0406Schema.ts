import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sprint0406Schema20260803000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── PAYMENT_METHOD (shared enum) ──────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
          CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'transfer', 'check', 'mixed');
        END IF;
      END $$;
    `);

    // ─── PAYMENTS ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "PAYMENTS" (
        payment_id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        society_id          uuid NOT NULL,
        client_id           uuid NOT NULL,
        sale_id             uuid NOT NULL,
        staff_id            uuid NOT NULL,
        route_sheet_item_id uuid,
        amount              numeric(12,2) NOT NULL,
        method              payment_method_enum NOT NULL DEFAULT 'cash',
        payment_date        timestamptz NOT NULL DEFAULT NOW(),
        notes               text,
        created_at          timestamptz NOT NULL DEFAULT NOW(),
        updated_at          timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payments_society ON "PAYMENTS" (society_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payments_client  ON "PAYMENTS" (client_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payments_sale    ON "PAYMENTS" (sale_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payments_staff   ON "PAYMENTS" (staff_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payments_route_sheet_item ON "PAYMENTS" (route_sheet_item_id);`);

    // ─── PAYMENT_INSTALLMENT_APPLICATIONS (imputación auto/manual) ────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "PAYMENT_INSTALLMENT_APPLICATIONS" (
        application_id  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        payment_id      uuid NOT NULL,
        installment_id  uuid NOT NULL,
        applied_amount  numeric(12,2) NOT NULL,
        created_at      timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payment_installment_apps_payment     ON "PAYMENT_INSTALLMENT_APPLICATIONS" (payment_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payment_installment_apps_installment ON "PAYMENT_INSTALLMENT_APPLICATIONS" (installment_id);`);

    // ─── FAILED_VISITS ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'failed_visit_reason_enum') THEN
          CREATE TYPE failed_visit_reason_enum AS ENUM ('client_absent', 'refused_payment', 'wrong_address', 'other');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "FAILED_VISITS" (
        failed_visit_id     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        route_sheet_item_id uuid NOT NULL,
        installment_id      uuid,
        client_id           uuid NOT NULL,
        staff_id            uuid NOT NULL,
        society_id          uuid NOT NULL,
        reason              failed_visit_reason_enum NOT NULL DEFAULT 'other',
        notes               text,
        attempt_number      integer NOT NULL,
        rescheduled_date    date,
        created_at          timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_failed_visits_route_sheet_item ON "FAILED_VISITS" (route_sheet_item_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_failed_visits_society          ON "FAILED_VISITS" (society_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_failed_visits_staff            ON "FAILED_VISITS" (staff_id);`);

    // ─── SUPPLIERS ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "SUPPLIERS" (
        supplier_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        society_id  uuid NOT NULL,
        name        varchar(255) NOT NULL,
        tax_id      varchar(50),
        phone       varchar(50),
        email       varchar(255),
        address     varchar(255),
        active      boolean NOT NULL DEFAULT true,
        created_at  timestamptz NOT NULL DEFAULT NOW(),
        updated_at  timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_suppliers_society ON "SUPPLIERS" (society_id);`);

    // ─── SUPPLIER_PAYMENTS ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "SUPPLIER_PAYMENTS" (
        supplier_payment_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplier_id         uuid NOT NULL,
        society_id          uuid NOT NULL,
        staff_id            uuid NOT NULL,
        amount              numeric(12,2) NOT NULL,
        method              payment_method_enum NOT NULL DEFAULT 'cash',
        payment_date        timestamptz NOT NULL DEFAULT NOW(),
        notes               text,
        created_at          timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_supplier_payments_supplier ON "SUPPLIER_PAYMENTS" (supplier_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_supplier_payments_society  ON "SUPPLIER_PAYMENTS" (society_id);`);

    // ─── CASHBOX ────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cashbox_status_enum') THEN
          CREATE TYPE cashbox_status_enum AS ENUM ('open', 'closed');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "CASHBOX" (
        cashbox_id      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        society_id      uuid NOT NULL,
        staff_id        uuid NOT NULL,
        opening_date    date NOT NULL,
        opening_balance numeric(12,2) NOT NULL,
        closing_balance numeric(12,2),
        status          cashbox_status_enum NOT NULL DEFAULT 'open',
        closed_at       timestamptz,
        notes           text,
        created_at      timestamptz NOT NULL DEFAULT NOW(),
        updated_at      timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_cashbox_society ON "CASHBOX" (society_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_cashbox_opening_date ON "CASHBOX" (opening_date);`);

    // ─── CASH_MOVEMENTS ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cash_movement_type_enum') THEN
          CREATE TYPE cash_movement_type_enum AS ENUM ('income', 'expense', 'transfer');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "CASH_MOVEMENTS" (
        movement_id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        cashbox_id               uuid NOT NULL,
        society_id               uuid NOT NULL,
        staff_id                 uuid NOT NULL,
        type                     cash_movement_type_enum NOT NULL,
        amount                   numeric(12,2) NOT NULL,
        concept                  varchar(255) NOT NULL,
        related_payment_id       uuid,
        related_supplier_payment_id uuid,
        created_at               timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_cash_movements_cashbox ON "CASH_MOVEMENTS" (cashbox_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_cash_movements_society ON "CASH_MOVEMENTS" (society_id);`);

    // ─── RECEIPTS ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "RECEIPTS" (
        receipt_id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        society_id          uuid NOT NULL,
        receipt_number      integer NOT NULL,
        payment_id          uuid,
        supplier_payment_id uuid,
        amount              numeric(12,2) NOT NULL,
        issued_at           timestamptz NOT NULL DEFAULT NOW(),
        created_at          timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_receipts_society_number ON "RECEIPTS" (society_id, receipt_number);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_receipts_payment ON "RECEIPTS" (payment_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_receipts_supplier_payment ON "RECEIPTS" (supplier_payment_id);`);

    // ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
          CREATE TYPE notification_type_enum AS ENUM ('payment', 'closure', 'sale', 'system');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "NOTIFICATIONS" (
        notification_id     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        society_id          uuid NOT NULL,
        type                notification_type_enum NOT NULL DEFAULT 'system',
        title               varchar(255) NOT NULL,
        message             text NOT NULL,
        related_entity_type varchar(100),
        related_entity_id   uuid,
        created_at          timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_society ON "NOTIFICATIONS" (society_id);`);

    // ─── NOTIFICATION_DELIVERIES ────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_delivery_status_enum') THEN
          CREATE TYPE notification_delivery_status_enum AS ENUM ('pending', 'sent', 'read', 'failed');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "NOTIFICATION_DELIVERIES" (
        delivery_id      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        notification_id  uuid NOT NULL,
        staff_id         uuid NOT NULL,
        status           notification_delivery_status_enum NOT NULL DEFAULT 'pending',
        sent_at          timestamptz,
        read_at          timestamptz,
        retry_count      integer NOT NULL DEFAULT 0,
        created_at       timestamptz NOT NULL DEFAULT NOW(),
        updated_at       timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification ON "NOTIFICATION_DELIVERIES" (notification_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notification_deliveries_staff        ON "NOTIFICATION_DELIVERIES" (staff_id);`);

    // ─── USER_CONFIGURATIONS ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "USER_CONFIGURATIONS" (
        user_configuration_id     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        staff_id                  uuid NOT NULL,
        dashboard_preferences     jsonb NOT NULL DEFAULT '{}',
        theme                     varchar(20) NOT NULL DEFAULT 'light',
        notification_preferences jsonb NOT NULL DEFAULT '{}',
        created_at                timestamptz NOT NULL DEFAULT NOW(),
        updated_at                timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_user_configurations_staff ON "USER_CONFIGURATIONS" (staff_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "USER_CONFIGURATIONS";`);

    await queryRunner.query(`DROP TABLE IF EXISTS "NOTIFICATION_DELIVERIES";`);
    await queryRunner.query(`DROP TYPE IF EXISTS notification_delivery_status_enum;`);

    await queryRunner.query(`DROP TABLE IF EXISTS "NOTIFICATIONS";`);
    await queryRunner.query(`DROP TYPE IF EXISTS notification_type_enum;`);

    await queryRunner.query(`DROP TABLE IF EXISTS "RECEIPTS";`);

    await queryRunner.query(`DROP TABLE IF EXISTS "CASH_MOVEMENTS";`);
    await queryRunner.query(`DROP TYPE IF EXISTS cash_movement_type_enum;`);

    await queryRunner.query(`DROP TABLE IF EXISTS "CASHBOX";`);
    await queryRunner.query(`DROP TYPE IF EXISTS cashbox_status_enum;`);

    await queryRunner.query(`DROP TABLE IF EXISTS "SUPPLIER_PAYMENTS";`);

    await queryRunner.query(`DROP TABLE IF EXISTS "SUPPLIERS";`);

    await queryRunner.query(`DROP TABLE IF EXISTS "FAILED_VISITS";`);
    await queryRunner.query(`DROP TYPE IF EXISTS failed_visit_reason_enum;`);

    await queryRunner.query(`DROP TABLE IF EXISTS "PAYMENT_INSTALLMENT_APPLICATIONS";`);

    await queryRunner.query(`DROP TABLE IF EXISTS "PAYMENTS";`);

    await queryRunner.query(`DROP TYPE IF EXISTS payment_method_enum;`);
  }
}
