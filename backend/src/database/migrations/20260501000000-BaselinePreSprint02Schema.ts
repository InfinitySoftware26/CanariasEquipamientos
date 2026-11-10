import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migración base (Punto 6, opción C).
 *
 * CLIENT, STAFF, SOCIETYS y SALES nunca tuvieron CREATE TABLE en una
 * migración: nacieron de synchronize. Esta migración los crea, con
 * IF NOT EXISTS, en la forma que tenían ANTES de Sprint02Schema20260610000001,
 * para que una base vacía pueda recorrer toda la cadena de migraciones.
 *
 * Fuente de la forma: entidades en el commit 6880df1^ (padre del commit que
 * agregó Sprint02). Se reproduce lo que synchronize generaba a partir de
 * ellas: tipos (string sin type → character varying), nullabilidad,
 * defaults, nombres de PK/UQ (DefaultNamingStrategy de TypeORM 0.3.30) y
 * enums con el nombre por defecto "<TABLA>_<columna>_enum".
 * No se agregan columnas que no estuvieran en esas entidades.
 *
 * También crea "SALES_payment_frequency_enum" e
 * "INSTALLMENTS_payment_frequency_enum", que 20260817000003 altera y que
 * solo existían en bases nacidas de synchronize. Valores tomados de
 * PaymentFrequency en 6880df1 (weekly, monthly). En una base nueva quedan
 * sin uso: las columnas usan payment_frequency_enum (Sprint02).
 *
 * En una base existente es un no-op (todo existe). Registra lo que crea en
 * migration_baseline_20260501000000 para que down() elimine solo eso.
 *
 * Orden: los últimos 13 caracteres del nombre dan 260501000000, anterior a
 * AddClientsHistory20260530120000 (260530120000). TypeORM 0.3.30 ejecuta las
 * migraciones pendientes aunque su timestamp sea anterior a las ya
 * ejecutadas (MigrationExecutor.js:154-164, chequeo comentado en 160-161).
 */

const TRACKING_TABLE = "migration_baseline_20260501000000";

interface EnumDef {
  name: string;
  values: string[];
}

const ENUMS: EnumDef[] = [
  { name: "SOCIETYS_status_enum", values: ["active", "inactive"] },
  {
    name: "STAFF_role_enum",
    values: ["super_admin", "gerente", "administrativo", "vendedor", "cobrador"],
  },
  {
    name: "SALES_payment_type_enum",
    values: ["cash", "card", "transfer", "check", "mixed"],
  },
  {
    name: "SALES_status_enum",
    values: ["pending", "approved", "paid", "defaulted", "cancelled", "repossessed"],
  },
  { name: "SALES_payment_frequency_enum", values: ["weekly", "monthly"] },
  { name: "INSTALLMENTS_payment_frequency_enum", values: ["weekly", "monthly"] },
];

/** Orden de creación; down() elimina en orden inverso. */
const TABLES: Array<{ name: string; ddl: string }> = [
  {
    name: "SOCIETYS",
    ddl: `
      CREATE TABLE "SOCIETYS" (
        "society_id"    uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name"          character varying NOT NULL,
        "business_name" character varying NOT NULL,
        "tax_id"        character varying NOT NULL,
        "address"       character varying,
        "phone"         character varying,
        "email"         character varying,
        "status"        "SOCIETYS_status_enum" NOT NULL DEFAULT 'active',
        "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_b14a9e5c11948b8f73ca23888b1" UNIQUE ("name"),
        CONSTRAINT "UQ_2c3493e82867f8575240129b77e" UNIQUE ("tax_id"),
        CONSTRAINT "PK_d22170fe0929bfef9b37a7599cf" PRIMARY KEY ("society_id")
      )`,
  },
  {
    name: "STAFF",
    ddl: `
      CREATE TABLE "STAFF" (
        "staff_id"      uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name"          character varying NOT NULL,
        "dni"           character varying NOT NULL,
        "email"         character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "role"          "STAFF_role_enum" NOT NULL,
        "society_id"    character varying,
        "phone"         character varying,
        "is_active"     boolean NOT NULL DEFAULT true,
        "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_75303d6b9690b692579f8ec2555" UNIQUE ("dni"),
        CONSTRAINT "UQ_c1b1d6b9306bf48106d89b8f284" UNIQUE ("email"),
        CONSTRAINT "PK_280bb2901825cd108a814d22d62" PRIMARY KEY ("staff_id")
      )`,
  },
  {
    name: "CLIENT",
    ddl: `
      CREATE TABLE "CLIENT" (
        "client_id"                      uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name"                           character varying,
        "surname"                        character varying,
        "document_number"                character varying,
        "address"                        character varying,
        "phone"                          character varying,
        "email"                          character varying,
        "support_dni"                    boolean NOT NULL DEFAULT false,
        "support_bill"                   boolean NOT NULL DEFAULT false,
        "support_visit"                  boolean NOT NULL DEFAULT false,
        "visit_name"                     character varying,
        "visit_date"                     TIMESTAMP WITH TIME ZONE,
        "observations"                   text,
        "society_id"                     character varying,
        "created_by"                     character varying,
        "updated_by"                     character varying,
        "verification_requested_by"      character varying,
        "verification_requested_by_name" character varying,
        "verification_requested_at"      TIMESTAMP WITH TIME ZONE,
        "verification_note"              text,
        "created_at"                     TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"                     TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_d49cdf4ff5da8b8314a9e3bfc0e" PRIMARY KEY ("client_id")
      )`,
  },
  {
    name: "SALES",
    ddl: `
      CREATE TABLE "SALES" (
        "sale_id"      uuid NOT NULL DEFAULT uuid_generate_v4(),
        "client_id"    character varying NOT NULL,
        "staff_id"     character varying NOT NULL,
        "society_id"   character varying NOT NULL,
        "payment_type" "SALES_payment_type_enum" NOT NULL,
        "total_amount" numeric(10,2) NOT NULL,
        "sale_date"    TIMESTAMP NOT NULL,
        "status"       "SALES_status_enum" NOT NULL DEFAULT 'pending',
        "observation"  character varying,
        "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fda4f47222d8ea7e8f0eaa08a6f" PRIMARY KEY ("sale_id")
      )`,
  },
];

export class BaselinePreSprint02Schema20260501000000 implements MigrationInterface {
  name = "BaselinePreSprint02Schema20260501000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${TRACKING_TABLE}" (
        object_kind text NOT NULL,
        object_name text NOT NULL,
        created_at  timestamptz NOT NULL DEFAULT NOW(),
        PRIMARY KEY (object_kind, object_name)
      )
    `);

    for (const e of ENUMS) {
      if (await this.typeExists(queryRunner, e.name)) continue;
      const values = e.values.map((v) => `'${v}'`).join(", ");
      await queryRunner.query(`CREATE TYPE "${e.name}" AS ENUM (${values})`);
      await this.track(queryRunner, "type", e.name);
    }

    for (const t of TABLES) {
      if (await this.tableExists(queryRunner, t.name)) continue;
      await queryRunner.query(t.ddl);
      await this.track(queryRunner, "table", t.name);
    }
  }

  /**
   * Elimina solo lo que up() creó. Se niega a borrar una tabla con filas
   * (aborta con mensaje) y no usa CASCADE: un tipo todavía en uso hace
   * fallar el DROP en vez de arrastrar columnas.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.tableExists(queryRunner, TRACKING_TABLE))) return;

    const created: Array<{ object_kind: string; object_name: string }> =
      await queryRunner.query(`SELECT object_kind, object_name FROM "${TRACKING_TABLE}"`);
    const createdTables = new Set(created.filter((c) => c.object_kind === "table").map((c) => c.object_name));
    const createdTypes = new Set(created.filter((c) => c.object_kind === "type").map((c) => c.object_name));

    for (const t of [...TABLES].reverse()) {
      if (!createdTables.has(t.name) || !(await this.tableExists(queryRunner, t.name))) continue;
      const [{ n }]: Array<{ n: string }> = await queryRunner.query(
        `SELECT COUNT(*) AS n FROM "${t.name}"`,
      );
      if (Number(n) > 0) {
        throw new Error(
          `[Baseline] Abortado: "${t.name}" tiene ${n} fila(s). down() solo ` +
            `elimina tablas vacías creadas por esta migración. No se modificó nada.`,
        );
      }
      await queryRunner.query(`DROP TABLE "${t.name}"`);
    }

    for (const e of [...ENUMS].reverse()) {
      if (!createdTypes.has(e.name) || !(await this.typeExists(queryRunner, e.name))) continue;
      await queryRunner.query(`DROP TYPE "${e.name}"`);
    }

    await queryRunner.query(`DROP TABLE "${TRACKING_TABLE}"`);
  }

  private async tableExists(queryRunner: QueryRunner, name: string): Promise<boolean> {
    const [row]: Array<{ reg: string | null }> = await queryRunner.query(
      `SELECT to_regclass($1) AS reg`,
      [`"${name}"`],
    );
    return !!row?.reg;
  }

  private async typeExists(queryRunner: QueryRunner, name: string): Promise<boolean> {
    const rows: unknown[] = await queryRunner.query(
      `SELECT 1
         FROM pg_type t
         JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = $1
          AND n.nspname = current_schema()`,
      [name],
    );
    return rows.length > 0;
  }

  private async track(queryRunner: QueryRunner, kind: "table" | "type", name: string): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "${TRACKING_TABLE}" (object_kind, object_name)
       VALUES ($1, $2)
       ON CONFLICT (object_kind, object_name) DO NOTHING`,
      [kind, name],
    );
  }
}
