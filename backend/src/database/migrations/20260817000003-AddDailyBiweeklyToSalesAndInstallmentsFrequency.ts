import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDailyBiweeklyToSalesAndInstallmentsFrequency20260817000003 implements MigrationInterface {
  name = "AddDailyBiweeklyToSalesAndInstallmentsFrequency20260817000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "SALES_payment_frequency_enum"
      ADD VALUE IF NOT EXISTS 'daily'
    `);

    await queryRunner.query(`
      ALTER TYPE "SALES_payment_frequency_enum"
      ADD VALUE IF NOT EXISTS 'biweekly'
    `);

    await queryRunner.query(`
      ALTER TYPE "INSTALLMENTS_payment_frequency_enum"
      ADD VALUE IF NOT EXISTS 'daily'
    `);

    await queryRunner.query(`
      ALTER TYPE "INSTALLMENTS_payment_frequency_enum"
      ADD VALUE IF NOT EXISTS 'biweekly'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /*
     * PostgreSQL no permite eliminar directamente un valor
     * de un enum de forma segura.
     *
     * Por eso esta migración solamente implementa up().
     */
  }
}
