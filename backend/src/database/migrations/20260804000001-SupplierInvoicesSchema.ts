import { MigrationInterface, QueryRunner } from 'typeorm';

export class SupplierInvoicesSchema20260804000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── SUPPLIER_INVOICE_STATUS ────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supplier_invoice_status_enum') THEN
          CREATE TYPE supplier_invoice_status_enum AS ENUM ('pending', 'partially_paid', 'paid', 'cancelled');
        END IF;
      END $$;
    `);

    // ─── SUPPLIER_INVOICES ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "SUPPLIER_INVOICES" (
        supplier_invoice_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        society_id          uuid NOT NULL,
        supplier_id         uuid NOT NULL,
        invoice_number      varchar(100) NOT NULL,
        issue_date          date NOT NULL,
        due_date            date,
        total_amount        numeric(12,2) NOT NULL,
        status              supplier_invoice_status_enum NOT NULL DEFAULT 'pending',
        notes               text,
        created_at          timestamptz NOT NULL DEFAULT NOW(),
        updated_at          timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_supplier_invoices_society  ON "SUPPLIER_INVOICES" (society_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_supplier_invoices_supplier ON "SUPPLIER_INVOICES" (supplier_id);`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_supplier_invoices_supplier_number ON "SUPPLIER_INVOICES" (supplier_id, invoice_number);`);

    // ─── SUPPLIER_INVOICE_PAYMENT_APPLICATIONS (imputación auto/manual) ───────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "SUPPLIER_INVOICE_PAYMENT_APPLICATIONS" (
        application_id      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplier_payment_id uuid NOT NULL,
        supplier_invoice_id uuid NOT NULL,
        applied_amount       numeric(12,2) NOT NULL,
        created_at           timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_supplier_invoice_apps_payment ON "SUPPLIER_INVOICE_PAYMENT_APPLICATIONS" (supplier_payment_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_supplier_invoice_apps_invoice ON "SUPPLIER_INVOICE_PAYMENT_APPLICATIONS" (supplier_invoice_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "SUPPLIER_INVOICE_PAYMENT_APPLICATIONS";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "SUPPLIER_INVOICES";`);
    await queryRunner.query(`DROP TYPE IF EXISTS supplier_invoice_status_enum;`);
  }
}
