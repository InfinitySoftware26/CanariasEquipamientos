import { BaselinePreSprint02Schema20260501000000 as Baseline } from '../migrations/20260501000000-BaselinePreSprint02Schema';
import {
  GuardSprint02OnPopulatedSales20260609000001 as Guard,
  SPRINT02_MIGRATION_NAME,
} from '../migrations/20260609000001-GuardSprint02OnPopulatedSales';

/**
 * Base simulada en memoria: tablas, tipos, filas por tabla y migraciones
 * registradas. Interpreta solo las sentencias que emiten estas migraciones.
 * No reemplaza la validación contra PostgreSQL (ver procedimiento manual).
 */
interface FakeDb {
  tables: Set<string>;
  types: Set<string>;
  rows: Record<string, number>;
  tracked: Array<{ object_kind: string; object_name: string }>;
  executed: string[];
  migrationsTable?: boolean;
}

function fakeRunner(db: FakeDb, migrationsTableName?: string) {
  const ddl: string[] = [];
  const query = jest.fn(async (sql: string, params: unknown[] = []) => {
    const s = sql.replace(/\s+/g, ' ').trim();
    const unq = (v: unknown) => String(v).replace(/"/g, '');

    if (s.startsWith('SELECT to_regclass($1) AS reg')) {
      const name = unq(params[0]);
      const exists = db.tables.has(name) || (name === (migrationsTableName ?? 'migrations') && !!db.migrationsTable);
      return [{ reg: exists ? name : null }];
    }
    if (s.startsWith(`SELECT to_regclass('"SALES"') AS reg`)) {
      return [{ reg: db.tables.has('SALES') ? 'SALES' : null }];
    }
    if (s.startsWith('SELECT 1 FROM pg_type')) {
      return db.types.has(String(params[0])) ? [{}] : [];
    }
    if (/^SELECT 1 FROM "\w+" WHERE name = \$1$/.test(s)) {
      return db.executed.includes(String(params[0])) ? [{}] : [];
    }
    const count = /^SELECT COUNT\(\*\) AS n FROM "(\w+)"$/.exec(s);
    if (count) return [{ n: String(db.rows[count[1]] ?? 0) }];
    if (s.startsWith('SELECT object_kind, object_name FROM')) return db.tracked;

    // ── escrituras ──
    const createType = /^CREATE TYPE "(\w+)"/.exec(s);
    if (createType) db.types.add(createType[1]);
    const createTable = /^CREATE TABLE (?:IF NOT EXISTS )?"(\w+)"/.exec(s);
    if (createTable) db.tables.add(createTable[1]);
    const dropTable = /^DROP TABLE "(\w+)"$/.exec(s);
    if (dropTable) db.tables.delete(dropTable[1]);
    const dropType = /^DROP TYPE "(\w+)"$/.exec(s);
    if (dropType) db.types.delete(dropType[1]);
    if (s.startsWith('INSERT INTO "migration_baseline_20260501000000"')) {
      db.tracked.push({ object_kind: String(params[0]), object_name: String(params[1]) });
    }
    ddl.push(s);
    return [];
  });
  const runner = { query, connection: { options: migrationsTableName ? { migrationsTableName } : {} } };
  return { runner: runner as any, ddl };
}

const emptyDb = (): FakeDb => ({
  tables: new Set(), types: new Set(), rows: {}, tracked: [], executed: [], migrationsTable: true,
});

const BASE_TABLES = ['SOCIETYS', 'STAFF', 'CLIENT', 'SALES'];
const BASE_TYPES = [
  'SOCIETYS_status_enum', 'STAFF_role_enum', 'SALES_payment_type_enum', 'SALES_status_enum',
  'SALES_payment_frequency_enum', 'INSTALLMENTS_payment_frequency_enum',
];
const ts = (name: string) => parseInt(name.substr(-13), 10);

describe('Orden de ejecución (TypeORM 0.3.30: últimos 13 caracteres)', () => {
  it('baseline < AddClientsHistory < guardia < Sprint02', () => {
    const baseline = ts(new Baseline().name);
    const guard = ts(new Guard().name);
    expect(baseline).toBeLessThan(ts('AddClientsHistory20260530120000'));
    expect(guard).toBeGreaterThan(ts('AddClientsHistory20260530120000'));
    expect(guard).toBeLessThan(ts(SPRINT02_MIGRATION_NAME));
  });
});

describe('BaselinePreSprint02Schema20260501000000', () => {
  it('base vacía: crea extensión, los 6 tipos y las 4 tablas, y los registra', async () => {
    const db = emptyDb();
    const { runner, ddl } = fakeRunner(db);
    await new Baseline().up(runner);

    expect(ddl[0]).toBe('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    BASE_TABLES.forEach((t) => expect(db.tables.has(t)).toBe(true));
    BASE_TYPES.forEach((t) => expect(db.types.has(t)).toBe(true));
    expect(db.tracked).toHaveLength(BASE_TABLES.length + BASE_TYPES.length);
  });

  it('tablas en forma previa a Sprint02 (columnas que Sprint02 reemplaza o borra)', async () => {
    const { runner, ddl } = fakeRunner(emptyDb());
    await new Baseline().up(runner);
    const sales = ddl.find((s) => s.startsWith('CREATE TABLE "SALES"'))!;
    expect(sales).toContain('"payment_type" "SALES_payment_type_enum" NOT NULL');
    expect(sales).toContain('"total_amount" numeric(10,2) NOT NULL');
    expect(sales).toContain(`"status" "SALES_status_enum" NOT NULL DEFAULT 'pending'`);
    expect(sales).toContain('"client_id" character varying NOT NULL');
    const staff = ddl.find((s) => s.startsWith('CREATE TABLE "STAFF"'))!;
    expect(staff).toContain('"society_id" character varying,');
    expect(staff).toContain('CONSTRAINT "UQ_75303d6b9690b692579f8ec2555" UNIQUE ("dni")');
  });

  it('enums de frecuencia con los valores de PaymentFrequency en 6880df1', async () => {
    const { runner, ddl } = fakeRunner(emptyDb());
    await new Baseline().up(runner);
    expect(ddl).toContain(`CREATE TYPE "SALES_payment_frequency_enum" AS ENUM ('weekly', 'monthly')`);
    expect(ddl).toContain(`CREATE TYPE "INSTALLMENTS_payment_frequency_enum" AS ENUM ('weekly', 'monthly')`);
  });

  it('base existente: no crea tablas ni tipos (no-op salvo tabla de registro)', async () => {
    const db = emptyDb();
    BASE_TABLES.forEach((t) => db.tables.add(t));
    BASE_TYPES.forEach((t) => db.types.add(t));
    const { runner, ddl } = fakeRunner(db);
    await new Baseline().up(runner);
    expect(ddl.filter((s) => s.startsWith('CREATE TYPE'))).toHaveLength(0);
    expect(ddl.filter((s) => /^CREATE TABLE "(SOCIETYS|STAFF|CLIENT|SALES)"/.test(s))).toHaveLength(0);
    expect(db.tracked).toHaveLength(0);
  });

  it('base existente sin los enums de frecuencia: crea solo esos dos', async () => {
    const db = emptyDb();
    BASE_TABLES.forEach((t) => db.tables.add(t));
    BASE_TYPES.slice(0, 4).forEach((t) => db.types.add(t));
    const { runner } = fakeRunner(db);
    await new Baseline().up(runner);
    expect(db.tracked.map((t) => t.object_name)).toEqual([
      'SALES_payment_frequency_enum', 'INSTALLMENTS_payment_frequency_enum',
    ]);
  });

  it('down: elimina solo lo creado, tablas antes que tipos', async () => {
    const db = emptyDb();
    const { runner } = fakeRunner(db);
    await new Baseline().up(runner);
    db.tables.add('migration_baseline_20260501000000');
    db.tables.add('OTHER');

    const { runner: r2, ddl } = fakeRunner(db);
    await new Baseline().down(r2);
    BASE_TABLES.forEach((t) => expect(db.tables.has(t)).toBe(false));
    BASE_TYPES.forEach((t) => expect(db.types.has(t)).toBe(false));
    expect(db.tables.has('OTHER')).toBe(true);
    const firstType = ddl.findIndex((s) => s.startsWith('DROP TYPE'));
    const lastTable = ddl.map((s) => s.startsWith('DROP TABLE "S') || s.startsWith('DROP TABLE "C')).lastIndexOf(true);
    expect(lastTable).toBeLessThan(firstType);
    expect(ddl.some((s) => s.includes('CASCADE'))).toBe(false);
  });

  it('down: no toca objetos preexistentes (base existente)', async () => {
    const db = emptyDb();
    BASE_TABLES.forEach((t) => db.tables.add(t));
    BASE_TYPES.forEach((t) => db.types.add(t));
    db.tables.add('migration_baseline_20260501000000');
    const { runner, ddl } = fakeRunner(db);
    await new Baseline().down(runner);
    expect(ddl.filter((s) => s.startsWith('DROP TYPE') || /^DROP TABLE "(SOCIETYS|STAFF|CLIENT|SALES)"/.test(s))).toHaveLength(0);
    BASE_TABLES.forEach((t) => expect(db.tables.has(t)).toBe(true));
  });

  it('down: aborta si una tabla creada tiene filas', async () => {
    const db = emptyDb();
    const { runner } = fakeRunner(db);
    await new Baseline().up(runner);
    db.tables.add('migration_baseline_20260501000000');
    db.rows.SALES = 3;
    const { runner: r2 } = fakeRunner(db);
    await expect(new Baseline().down(r2)).rejects.toThrow(/"SALES" tiene 3 fila\(s\)/);
    expect(db.tables.has('SALES')).toBe(true);
  });
});

describe('GuardSprint02OnPopulatedSales20260609000001', () => {
  const withSales = (rows: number, executed: string[] = []): FakeDb => {
    const db = emptyDb();
    db.tables.add('SALES');
    db.rows.SALES = rows;
    db.executed = executed;
    return db;
  };

  it('base vacía (SALES sin filas) → pasa', async () => {
    const { runner } = fakeRunner(withSales(0));
    await expect(new Guard().up(runner)).resolves.toBeUndefined();
  });

  it('SALES con filas y Sprint02 ya ejecutada → pasa', async () => {
    const { runner } = fakeRunner(withSales(10, [SPRINT02_MIGRATION_NAME]));
    await expect(new Guard().up(runner)).resolves.toBeUndefined();
  });

  it('SALES con filas y Sprint02 no ejecutada → aborta con mensaje claro', async () => {
    const { runner, ddl } = fakeRunner(withSales(10));
    await expect(new Guard().up(runner)).rejects.toThrow(
      /"SALES" tiene 10 fila\(s\) y Sprint02Schema20260610000001 no figura como ejecutada/,
    );
    expect(ddl).toHaveLength(0);
  });

  it('respeta migrationsTableName configurado', async () => {
    const db = withSales(10, [SPRINT02_MIGRATION_NAME]);
    const { runner } = fakeRunner(db, 'typeorm_migrations');
    await expect(new Guard().up(runner)).resolves.toBeUndefined();
    expect(runner.query).toHaveBeenCalledWith(expect.stringContaining('FROM "typeorm_migrations"'), [SPRINT02_MIGRATION_NAME]);
  });

  it('sin tabla de migraciones y SALES con filas → aborta', async () => {
    const db = withSales(1);
    db.migrationsTable = false;
    const { runner } = fakeRunner(db);
    await expect(new Guard().up(runner)).rejects.toThrow(/GuardSprint02/);
  });

  it('down no modifica nada', async () => {
    const { runner } = fakeRunner(withSales(10));
    await new Guard().down(runner);
    expect(runner.query).not.toHaveBeenCalled();
  });
});
