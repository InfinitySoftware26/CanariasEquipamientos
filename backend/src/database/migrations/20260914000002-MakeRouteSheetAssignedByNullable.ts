import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeRouteSheetAssignedByNullable20260914000002 implements MigrationInterface {
  name = "MakeRouteSheetAssignedByNullable20260914000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ROUTE_SHEETS"
      ALTER COLUMN "assigned_by" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * Antes de volver a NOT NULL nos aseguramos de que
     * no existan registros automáticos con assigned_by null.
     *
     * Si existen, el rollback deberá resolverlos antes.
     */
    const rows: Array<{
      count: string;
    }> = await queryRunner.query(`
      SELECT COUNT(*)::text AS count
      FROM "ROUTE_SHEETS"
      WHERE "assigned_by" IS NULL
    `);

    const nullCount = Number(rows[0]?.count ?? 0);

    if (nullCount > 0) {
      throw new Error(
        `No se puede restaurar assigned_by como NOT NULL: existen ${nullCount} hojas automáticas sin assigned_by`,
      );
    }

    await queryRunner.query(`
      ALTER TABLE "ROUTE_SHEETS"
      ALTER COLUMN "assigned_by" SET NOT NULL
    `);
  }
}
