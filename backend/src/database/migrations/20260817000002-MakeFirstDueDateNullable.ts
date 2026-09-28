import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeFirstDueDateNullable20260817000002
  implements MigrationInterface
{
  name = "MakeFirstDueDateNullable20260817000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SALES"
      ALTER COLUMN "first_due_date" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SALES"
      ALTER COLUMN "first_due_date" SET NOT NULL
    `);
  }
}