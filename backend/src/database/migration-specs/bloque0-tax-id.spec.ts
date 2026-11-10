import { Bloque0UuidColumnsAndUniqueIndexes20261110000001 as Bloque0 } from '../migrations/20261110000001-Bloque0UuidColumnsAndUniqueIndexes';

/**
 * Runbook E.3: la migración del Bloque 0 convierte solo una lista explícita
 * de columnas *_id / *_by. Aunque information_schema reporte TODAS las
 * columnas como varchar (incluidas SOCIETYS.tax_id y SUPPLIERS.tax_id, que
 * son CUIT), ninguna sentencia debe mencionarlas.
 */
function allVarcharRunner() {
  const sql: Array<{ s: string; params: unknown[] }> = [];
  const query = jest.fn(async (raw: string, params: unknown[] = []) => {
    const s = raw.replace(/\s+/g, ' ').trim();
    sql.push({ s, params });
    if (s.startsWith('SELECT data_type FROM information_schema.columns')) return [{ data_type: 'character varying' }];
    if (s.startsWith('SELECT COUNT(*) AS n FROM')) return [{ n: '0' }];
    if (s.startsWith('SELECT c.conname')) return [];
    if (s.startsWith('SELECT format_type')) return [{ original_type: 'character varying' }];
    if (s.startsWith('SELECT COUNT(*) AS dup_groups')) return [{ dup_groups: '0', dup_rows: '0' }];
    if (s.startsWith('SELECT to_regclass')) return [{ to_regclass: 'x' }];
    if (s.startsWith('SELECT table_name, column_name, original_type')) {
      return [{ table_name: 'CLIENT', column_name: 'society_id', original_type: 'character varying' }];
    }
    return [];
  });
  return { runner: { query } as any, sql };
}

const mentionsTaxId = (entry: { s: string; params: unknown[] }) =>
  /tax_id|"SOCIETYS"|"SUPPLIERS"/i.test(entry.s) ||
  entry.params.some((p) => /^(tax_id|SOCIETYS|SUPPLIERS)$/i.test(String(p)));

describe('Bloque0 — no toca SOCIETYS.tax_id ni SUPPLIERS.tax_id', () => {
  it('up(): ninguna consulta ni sentencia menciona tax_id, SOCIETYS o SUPPLIERS', async () => {
    const { runner, sql } = allVarcharRunner();
    await new Bloque0().up(runner);
    expect(sql.filter(mentionsTaxId)).toEqual([]);
    // Sanity: sí convirtió columnas de su lista.
    expect(sql.some((e) => e.s.includes('ALTER TABLE "CLIENT" ALTER COLUMN "society_id" TYPE uuid'))).toBe(true);
  });

  it('up(): las columnas consultadas son solo las de su lista explícita (*_id / *_by de 4 tablas)', async () => {
    const { runner, sql } = allVarcharRunner();
    await new Bloque0().up(runner);
    const inspected = sql
      .filter((e) => e.s.startsWith('SELECT data_type FROM information_schema.columns'))
      .map((e) => `${e.params[0]}.${e.params[1]}`);
    expect(new Set(inspected.map((c) => c.split('.')[0]))).toEqual(new Set(['CLIENT', 'CLIENT_HISTORY', 'PRODUCTS', 'SALE_PRODUCTS']));
    inspected.forEach((c) => expect(c).toMatch(/_(id|by)$/));
  });

  it('down(): tampoco menciona tax_id, SOCIETYS ni SUPPLIERS', async () => {
    const { runner, sql } = allVarcharRunner();
    await new Bloque0().down(runner);
    expect(sql.filter(mentionsTaxId)).toEqual([]);
  });
});
