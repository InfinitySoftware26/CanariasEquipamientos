import { Bloque0UuidColumnsAndUniqueIndexes20261110000001 as Migration } from '../migrations/20261110000001-Bloque0UuidColumnsAndUniqueIndexes';

/**
 * QueryRunner simulado: responde a las consultas de catálogo/diagnóstico
 * según un estado en memoria y registra las sentencias DDL emitidas.
 * No reemplaza una prueba contra PostgreSQL real.
 */
interface FakeState {
  types: Record<string, string>; // "TABLE.column" → data_type
  invalid?: Record<string, number>; // "TABLE.column" → valores no UUID
  fks?: Record<string, string[]>;
  closureDuplicates?: number;
  cashboxDuplicates?: number;
  tracked?: Array<{ table_name: string; column_name: string; original_type: string }>;
}

function fakeRunner(state: FakeState) {
  const ddl: string[] = [];
  const query = jest.fn(async (sql: string, params: unknown[] = []) => {
    const s = sql.replace(/\s+/g, ' ').trim();
    const key = () => `${String(params[0]).replace(/"/g, '')}.${params[1]}`;

    if (s.startsWith('SELECT data_type FROM information_schema.columns')) {
      const t = state.types[key()];
      return t ? [{ data_type: t }] : [];
    }
    if (s.startsWith('SELECT COUNT(*) AS n FROM')) {
      const m = /FROM "(\w+)" WHERE "(\w+)"/.exec(s)!;
      return [{ n: String(state.invalid?.[`${m[1]}.${m[2]}`] ?? 0) }];
    }
    if (s.startsWith('SELECT c.conname')) {
      return (state.fks?.[key()] ?? []).map((conname) => ({ conname }));
    }
    if (s.startsWith('SELECT format_type')) {
      return [{ original_type: 'character varying' }];
    }
    if (s.startsWith('SELECT COUNT(*) AS dup_groups')) {
      const n = s.includes('"DAILY_CLOSURES"') ? state.closureDuplicates ?? 0 : state.cashboxDuplicates ?? 0;
      return [{ dup_groups: String(n), dup_rows: String(n * 2) }];
    }
    if (s.startsWith('SELECT to_regclass')) {
      return [{ to_regclass: state.tracked ? 'tracking' : null }];
    }
    if (s.startsWith('SELECT table_name, column_name, original_type')) {
      return state.tracked ?? [];
    }
    ddl.push(s);
    return [];
  });
  return { runner: { query } as any, ddl };
}

const ALL_UUID: Record<string, string> = {
  'CLIENT.client_id': 'uuid', 'CLIENT.zone_id': 'uuid', 'CLIENT.society_id': 'uuid',
  'CLIENT.created_by': 'uuid', 'CLIENT.updated_by': 'uuid', 'CLIENT.verification_requested_by': 'uuid',
  'CLIENT_HISTORY.client_id': 'uuid', 'CLIENT_HISTORY.performed_by': 'uuid',
  'PRODUCTS.product_id': 'uuid', 'PRODUCTS.society_id': 'uuid',
  'SALE_PRODUCTS.sale_product_id': 'uuid', 'SALE_PRODUCTS.sale_id': 'uuid', 'SALE_PRODUCTS.product_id': 'uuid',
};

describe('Bloque0UuidColumnsAndUniqueIndexes20261110000001', () => {
  it('nombre con timestamp de 13 dígitos posterior a la última migración', () => {
    const ts = (n: string) => parseInt(n.substr(-13), 10);
    expect(ts(new Migration().name)).toBeGreaterThan(ts('SocietyLateInterestDefault20260921000001'));
  });

  it('base ya en uuid: no convierte columnas, crea ambos índices', async () => {
    const { runner, ddl } = fakeRunner({ types: ALL_UUID });
    await new Migration().up(runner);
    expect(ddl.some((s) => s.includes('TYPE uuid'))).toBe(false);
    expect(ddl.some((s) => s.includes('uq_daily_closures_staff_date_not_rejected') && s.includes("WHERE status <> 'rejected'"))).toBe(true);
    expect(ddl.some((s) => s.includes('uq_cashbox_one_open_per_society') && s.includes("WHERE status = 'open'"))).toBe(true);
  });

  it('columna varchar con datos válidos: convierte con USING ::uuid y la registra', async () => {
    const { runner, ddl } = fakeRunner({ types: { ...ALL_UUID, 'CLIENT.society_id': 'character varying' } });
    await new Migration().up(runner);
    expect(ddl).toContain('ALTER TABLE "CLIENT" ALTER COLUMN "society_id" TYPE uuid USING "society_id"::uuid');
    expect(runner.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO "migration_uuid_conversions_20261110000001"'),
      ['CLIENT', 'society_id', 'character varying'],
    );
  });

  it('columna inexistente: se saltea', async () => {
    const types = { ...ALL_UUID };
    delete types['CLIENT.verification_requested_by'];
    const { runner } = fakeRunner({ types });
    await expect(new Migration().up(runner)).resolves.toBeUndefined();
  });

  it('valores no UUID: aborta indicando tabla, columna y cantidad, sin ALTER', async () => {
    const { runner, ddl } = fakeRunner({
      types: { ...ALL_UUID, 'PRODUCTS.society_id': 'character varying' },
      invalid: { 'PRODUCTS.society_id': 3 },
    });
    await expect(new Migration().up(runner)).rejects.toThrow(/PRODUCTS\.society_id .* 3 valor\(es\)/);
    expect(ddl.some((s) => s.includes('TYPE uuid'))).toBe(false);
  });

  it('columna con FK: aborta sin tocar constraints', async () => {
    const { runner } = fakeRunner({
      types: { ...ALL_UUID, 'SALE_PRODUCTS.sale_id': 'character varying' },
      fks: { 'SALE_PRODUCTS.sale_id': ['FK_sale'] },
    });
    await expect(new Migration().up(runner)).rejects.toThrow(/SALE_PRODUCTS\.sale_id .* FK_sale/);
  });

  it('duplicados en DAILY_CLOSURES: aborta antes de crear el índice', async () => {
    const { runner, ddl } = fakeRunner({ types: ALL_UUID, closureDuplicates: 2 });
    await expect(new Migration().up(runner)).rejects.toThrow(/DAILY_CLOSURES tiene 2 grupo\(s\)/);
    expect(ddl.some((s) => s.includes('CREATE UNIQUE INDEX'))).toBe(false);
  });

  it('más de una caja abierta por sociedad: aborta antes de crear el índice', async () => {
    const { runner, ddl } = fakeRunner({ types: ALL_UUID, cashboxDuplicates: 1 });
    await expect(new Migration().up(runner)).rejects.toThrow(/CASHBOX tiene 1 grupo\(s\)/);
    expect(ddl.some((s) => s.includes('uq_cashbox_one_open_per_society'))).toBe(false);
  });

  it('down: elimina índices y revierte solo las columnas registradas a su tipo original', async () => {
    const { runner, ddl } = fakeRunner({
      types: { ...ALL_UUID },
      tracked: [{ table_name: 'CLIENT', column_name: 'society_id', original_type: 'character varying' }],
    });
    await new Migration().down(runner);
    expect(ddl).toContain('DROP INDEX IF EXISTS uq_cashbox_one_open_per_society');
    expect(ddl).toContain('DROP INDEX IF EXISTS uq_daily_closures_staff_date_not_rejected');
    expect(ddl).toContain(
      'ALTER TABLE "CLIENT" ALTER COLUMN "society_id" TYPE character varying USING "society_id"::text::character varying',
    );
    expect(ddl.filter((s) => s.startsWith('ALTER TABLE'))).toHaveLength(1);
    expect(ddl).toContain('DROP TABLE "migration_uuid_conversions_20261110000001"');
  });

  it('down sin conversiones registradas: solo elimina índices', async () => {
    const { runner, ddl } = fakeRunner({ types: ALL_UUID });
    await new Migration().down(runner);
    expect(ddl.filter((s) => s.startsWith('ALTER TABLE'))).toHaveLength(0);
  });
});
