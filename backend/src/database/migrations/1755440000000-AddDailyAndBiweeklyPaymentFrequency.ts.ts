import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDailyAndBiweeklyPaymentFrequency1755440000000 implements MigrationInterface {
  name = "AddDailyAndBiweeklyPaymentFrequency1755440000000";


  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "payment_frequency_enum"
      ADD VALUE IF NOT EXISTS 'daily'
    `);

    await queryRunner.query(`
      ALTER TYPE "payment_frequency_enum"
      ADD VALUE IF NOT EXISTS 'biweekly'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL no permite eliminar directamente valores
    // individuales de un ENUM.
    //
    // No hacemos rollback automático para evitar pérdida
    // accidental de datos que puedan utilizar estos valores.
  }
}
