import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSellerCommissionToSales20260704000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SALES"
        ADD COLUMN IF NOT EXISTS seller_commission_rate numeric(5,4) NOT NULL DEFAULT 0.10,
        ADD COLUMN IF NOT EXISTS seller_commission numeric(12,2);
    `);

    // Backfill de ventas existentes: comisión = 10% del total_amount ya registrado.
    await queryRunner.query(`
      UPDATE "SALES"
      SET seller_commission = ROUND(total_amount * 0.10, 2)
      WHERE seller_commission IS NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES" ALTER COLUMN seller_commission SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SALES"
        DROP COLUMN IF EXISTS seller_commission,
        DROP COLUMN IF EXISTS seller_commission_rate;
    `);
  }
}
