import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Bloque 0 — base técnica.
 *
 * a) Convierte a uuid las columnas *_id / *_by de CLIENT, CLIENT_HISTORY,
 *    PRODUCTS y SALE_PRODUCTS que information_schema reporte con otro tipo
 *    (bases nacidas de synchronize). Antes de cada conversión verifica que no
 *    haya valores que no sean UUID válidos; si los hay, aborta indicando
 *    tabla, columna y cantidad. No modifica ni borra datos.
 * b) Índice único parcial DAILY_CLOSURES (staff_id, closing_date)
 *    WHERE status <> 'rejected'.
 * c) Índice único parcial: una sola caja abierta por sociedad
 *    (CASHBOX.status = 'open'; columna "status", enum cashbox_status_enum).
 * d) Antes de cada índice verifica duplicados; si existen, aborta. No
 *    deduplica ni borra datos.
 *
 * Idempotente: las columnas ya uuid se saltean y los índices usan
 * IF NOT EXISTS. Las conversiones realizadas se registran en
 * migration_uuid_conversions_20261110000001 para que down() revierta solo
 * esas columnas, a su tipo original exacto.
 *
 * Orden: TypeORM 0.3.30 (MigrationExecutor.getMigrations) toma los últimos 13
 * caracteres del nombre de la clase como timestamp → 261110000001, posterior
 * a SocietyLateInterestDefault20260921000001 (260921000001).
 *
 * ATENCIÓN: en producción migrationsRun está activo (database.config.ts); si
 * esta migración aborta por datos inválidos o duplicados, el arranque falla.
 * Correr antes docs/Data-Base/diagnostics/preflight-20261110000001.sql.
 */

const TRACKING_TABLE = "migration_uuid_conversions_20261110000001";

/** Columnas a convertir, tomadas de las entidades actuales. */
const UUID_COLUMNS: Record<string, string[]> = {
  CLIENT: [
    "client_id",
    "zone_id",
    "society_id",
    "created_by",
    "updated_by",
    "verification_requested_by",
  ],
  CLIENT_HISTORY: ["client_id", "performed_by"],
  PRODUCTS: ["product_id", "society_id"],
  SALE_PRODUCTS: ["sale_product_id", "sale_id", "product_id"],
};

const UUID_REGEX =
  "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";

const UQ_DAILY_CLOSURE = "uq_daily_closures_staff_date_not_rejected";
const UQ_OPEN_CASHBOX = "uq_cashbox_one_open_per_society";

export class Bloque0UuidColumnsAndUniqueIndexes20261110000001
  implements MigrationInterface
{
  name = "Bloque0UuidColumnsAndUniqueIndexes20261110000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${TRACKING_TABLE}" (
        table_name    text NOT NULL,
        column_name   text NOT NULL,
        original_type text NOT NULL,
        converted_at  timestamptz NOT NULL DEFAULT NOW(),
        PRIMARY KEY (table_name, column_name)
      )
    `);

    // ─── a) Conversión a uuid ────────────────────────────────────────────────
    for (const [table, columns] of Object.entries(UUID_COLUMNS)) {
      for (const column of columns) {
        await this.convertColumnToUuid(queryRunner, table, column);
      }
    }

    // ─── b) Un cierre diario no rechazado por cobrador y fecha ──────────────
    await this.assertNoDuplicates(
      queryRunner,
      "DAILY_CLOSURES",
      `SELECT staff_id, closing_date, COUNT(*) AS n
         FROM "DAILY_CLOSURES"
        WHERE status <> 'rejected'
        GROUP BY staff_id, closing_date
       HAVING COUNT(*) > 1`,
      "(staff_id, closing_date) con status <> 'rejected'",
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ${UQ_DAILY_CLOSURE}
        ON "DAILY_CLOSURES" (staff_id, closing_date)
        WHERE status <> 'rejected'
    `);

    // ─── c) Una sola caja abierta por sociedad ──────────────────────────────
    await this.assertNoDuplicates(
      queryRunner,
      "CASHBOX",
      `SELECT society_id, COUNT(*) AS n
         FROM "CASHBOX"
        WHERE status = 'open'
        GROUP BY society_id
       HAVING COUNT(*) > 1`,
      "society_id con más de una caja en status = 'open'",
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ${UQ_OPEN_CASHBOX}
        ON "CASHBOX" (society_id)
        WHERE status = 'open'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS ${UQ_OPEN_CASHBOX}`);
    await queryRunner.query(`DROP INDEX IF EXISTS ${UQ_DAILY_CLOSURE}`);

    const tracking: Array<{ to_regclass: string | null }> =
      await queryRunner.query(`SELECT to_regclass('"${TRACKING_TABLE}"')`);
    if (!tracking[0]?.to_regclass) return;

    // Revierte solo lo que up() convirtió, al tipo original exacto.
    const converted: Array<{
      table_name: string;
      column_name: string;
      original_type: string;
    }> = await queryRunner.query(
      `SELECT table_name, column_name, original_type
         FROM "${TRACKING_TABLE}"
        ORDER BY converted_at DESC, table_name, column_name`,
    );

    for (const row of converted) {
      const exists = await this.columnType(
        queryRunner,
        row.table_name,
        row.column_name,
      );
      if (exists === null) continue;
      await queryRunner.query(
        `ALTER TABLE "${row.table_name}"
           ALTER COLUMN "${row.column_name}"
           TYPE ${row.original_type}
           USING "${row.column_name}"::text::${row.original_type}`,
      );
    }

    await queryRunner.query(`DROP TABLE "${TRACKING_TABLE}"`);
  }

  // ─── helpers ──────────────────────────────────────────────────────────────

  /** data_type según information_schema, o null si la columna no existe. */
  private async columnType(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<string | null> {
    const rows: Array<{ data_type: string }> = await queryRunner.query(
      `SELECT data_type
         FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = $1
          AND column_name = $2`,
      [table, column],
    );
    return rows[0]?.data_type ?? null;
  }

  private async convertColumnToUuid(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<void> {
    const dataType = await this.columnType(queryRunner, table, column);
    if (dataType === null || dataType === "uuid") return;

    // Valores que no son UUID válido (NULL se admite).
    const [{ n: invalid }]: Array<{ n: string }> = await queryRunner.query(
      `SELECT COUNT(*) AS n
         FROM "${table}"
        WHERE "${column}" IS NOT NULL
          AND "${column}"::text !~ $1`,
      [UUID_REGEX],
    );
    if (Number(invalid) > 0) {
      throw new Error(
        `[Bloque0] Abortado: ${table}.${column} (${dataType}) tiene ${invalid} ` +
          `valor(es) que no son UUID válidos. No se modificó ningún dato. ` +
          `Corregir esos registros y volver a ejecutar la migración.`,
      );
    }

    // Una FK sobre la columna (en cualquier sentido) impediría el cambio de
    // tipo de un solo lado; no se tocan constraints en este bloque.
    const fks: Array<{ conname: string }> = await queryRunner.query(
      `SELECT c.conname
         FROM pg_constraint c
         JOIN pg_attribute a
           ON (a.attrelid = c.conrelid  AND a.attnum = ANY (c.conkey))
           OR (a.attrelid = c.confrelid AND a.attnum = ANY (c.confkey))
        WHERE c.contype = 'f'
          AND a.attrelid = to_regclass($1)
          AND a.attname = $2`,
      [`"${table}"`, column],
    );
    if (fks.length > 0) {
      throw new Error(
        `[Bloque0] Abortado: ${table}.${column} (${dataType}) participa en ` +
          `clave(s) foránea(s) ${fks.map((f) => f.conname).join(", ")}. ` +
          `La conversión requiere tratar ambos extremos; no se modificó ningún dato.`,
      );
    }

    const [{ original_type }]: Array<{ original_type: string }> =
      await queryRunner.query(
        `SELECT format_type(a.atttypid, a.atttypmod) AS original_type
           FROM pg_attribute a
          WHERE a.attrelid = to_regclass($1)
            AND a.attname = $2`,
        [`"${table}"`, column],
      );

    await queryRunner.query(
      `ALTER TABLE "${table}"
         ALTER COLUMN "${column}" TYPE uuid USING "${column}"::uuid`,
    );
    await queryRunner.query(
      `INSERT INTO "${TRACKING_TABLE}" (table_name, column_name, original_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (table_name, column_name) DO NOTHING`,
      [table, column, original_type],
    );
  }

  private async assertNoDuplicates(
    queryRunner: QueryRunner,
    table: string,
    duplicatesSql: string,
    description: string,
  ): Promise<void> {
    const [{ dup_groups, dup_rows }]: Array<{ dup_groups: string; dup_rows: string }> =
      await queryRunner.query(
        `SELECT COUNT(*) AS dup_groups, COALESCE(SUM(n), 0) AS dup_rows
           FROM (${duplicatesSql}) d`,
      );
    if (Number(dup_groups) > 0) {
      throw new Error(
        `[Bloque0] Abortado: ${table} tiene ${dup_groups} grupo(s) duplicado(s) ` +
          `(${dup_rows} filas) en ${description}. No se creó el índice único ni ` +
          `se modificó ningún dato. Resolver los duplicados y volver a ejecutar.`,
      );
    }
  }
}
