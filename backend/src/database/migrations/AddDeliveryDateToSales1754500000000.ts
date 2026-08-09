import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeliveryDateToSales1754500000000 implements MigrationInterface {
  name = "AddDeliveryDateToSales1754500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SALES"
      ADD COLUMN "deliverydate" date NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SALES"
      DROP COLUMN "deliverydate";
    `);
  }
}
