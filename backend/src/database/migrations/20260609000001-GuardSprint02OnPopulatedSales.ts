import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Guardia previa a Sprint02Schema20260610000001 (Punto 6, opción C).
 *
 * Sprint02 convierte SALES.status con
 *   USING 'pending_admin_validation'::sale_status_enum
 * (todas las ventas quedan pendientes de validación) y hace
 *   DROP COLUMN total_amount + ADD COLUMN total_amount
 * (se pierde el importe). Es inocuo en una base vacía, pero destructivo si
 * SALES tiene datos y Sprint02 todavía no figura como ejecutada: el caso de
 * una base nacida de synchronize que empieza a usar migraciones.
 *
 * Esta migración aborta en ese caso. No modifica datos ni esquema.
 *
 * Orden: últimos 13 caracteres → 260609000001, después de la migración base
 * (260501000000) y de AddClientsHistory (260530120000), antes de Sprint02
 * (260610000001). En bases donde Sprint02 ya corrió, pasa sin hacer nada.
 */

export const SPRINT02_MIGRATION_NAME = "Sprint02Schema20260610000001";

export class GuardSprint02OnPopulatedSales20260609000001 implements MigrationInterface {
  name = "GuardSprint02OnPopulatedSales20260609000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [salesReg]: Array<{ reg: string | null }> = await queryRunner.query(
      `SELECT to_regclass('"SALES"') AS reg`,
    );
    if (!salesReg?.reg) return;

    if (await this.sprint02Executed(queryRunner)) return;

    const [{ n }]: Array<{ n: string }> = await queryRunner.query(
      `SELECT COUNT(*) AS n FROM "SALES"`,
    );
    if (Number(n) > 0) {
      throw new Error(
        `[GuardSprint02] Abortado: "SALES" tiene ${n} fila(s) y ` +
          `${SPRINT02_MIGRATION_NAME} no figura como ejecutada. Esa migración ` +
          `pondría todas las ventas en 'pending_admin_validation' y borraría ` +
          `total_amount. No se modificó nada. Si el esquema ya corresponde a ` +
          `Sprint02 o posterior (base nacida de synchronize), registrar las ` +
          `migraciones ya aplicadas en la tabla de migraciones tras verificar ` +
          `el esquema; si no, restaurar un backup antes de continuar.`,
      );
    }
  }

  /**
   * up() no crea ni modifica objetos, así que no hay nada que revertir: el
   * down() correcto es no hacer cambios. Se deja explícito para que el
   * revert de la cadena pase por esta migración sin error.
   */
  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  private async sprint02Executed(queryRunner: QueryRunner): Promise<boolean> {
    const options = queryRunner.connection.options as { migrationsTableName?: string };
    const table = options.migrationsTableName ?? "migrations";
    const [reg]: Array<{ reg: string | null }> = await queryRunner.query(
      `SELECT to_regclass($1) AS reg`,
      [`"${table}"`],
    );
    if (!reg?.reg) return false;
    const rows: unknown[] = await queryRunner.query(
      `SELECT 1 FROM "${table}" WHERE name = $1`,
      [SPRINT02_MIGRATION_NAME],
    );
    return rows.length > 0;
  }
}
