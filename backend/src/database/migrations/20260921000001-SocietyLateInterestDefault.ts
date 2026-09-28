import {
  MigrationInterface,
  QueryRunner,
} from "typeorm";

export class SocietyLateInterestDefault20260921000001
  implements MigrationInterface
{
  name =
    "SocietyLateInterestDefault20260921000001";

  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SOCIETYS"
      ADD COLUMN IF NOT EXISTS "default_daily_late_interest_rate"
      numeric(12,6) NOT NULL DEFAULT 0
    `);
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SOCIETYS"
      DROP COLUMN IF EXISTS "default_daily_late_interest_rate"
    `);
  }
}