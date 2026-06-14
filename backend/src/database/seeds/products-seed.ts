/**
 * Seed de productos electrodomésticos para demo/desarrollo.
 * Requiere que exista al menos una sociedad en la BD.
 * Uso:
 *   SEED_SOCIETY_ID=<uuid> pnpm exec ts-node -r tsconfig-paths/register src/database/seeds/products-seed.ts
 *
 * Es idempotente: si ya existen productos con el mismo nombre+societyId, no duplica.
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';

const PRODUCTS = [
  { name: 'Heladera No Frost',      brand: 'Samsung',     model: 'RT32K5730S8',    category: 'Electrodomésticos', price: 480000, costPrice: 340000 },
  { name: 'Heladera con Freezer',   brand: 'Whirlpool',   model: 'WRB36LFBZ',      category: 'Electrodomésticos', price: 390000, costPrice: 275000 },
  { name: 'Lavarropas Automático',  brand: 'LG',          model: 'WT7305CW',        category: 'Electrodomésticos', price: 320000, costPrice: 225000 },
  { name: 'Lavarropas Carga Frontal', brand: 'Samsung',   model: 'WW11BB504DAWBH',  category: 'Electrodomésticos', price: 420000, costPrice: 295000 },
  { name: 'Cocina a Gas 4 Hornallas', brand: 'Longvie',   model: '9860GF',          category: 'Electrodomésticos', price: 180000, costPrice: 125000 },
  { name: 'Cocina a Gas 6 Hornallas', brand: 'Patrick',   model: 'PA9060EI',        category: 'Electrodomésticos', price: 250000, costPrice: 175000 },
  { name: 'Televisor Smart 43"',    brand: 'LG',          model: '43UR7800PSB',     category: 'Electrónica',       price: 350000, costPrice: 245000 },
  { name: 'Televisor Smart 55"',    brand: 'Samsung',     model: 'UN55TU7000',      category: 'Electrónica',       price: 550000, costPrice: 385000 },
  { name: 'Televisor Smart 65"',    brand: 'TCL',         model: '65C645',          category: 'Electrónica',       price: 720000, costPrice: 504000 },
  { name: 'Aire Acondicionado Split 3000f', brand: 'Midea', model: 'MSA18CR-A',    category: 'Climatización',     price: 380000, costPrice: 265000 },
  { name: 'Aire Acondicionado Split 5000f', brand: 'Carrier', model: '42XCC18Y',   category: 'Climatización',     price: 520000, costPrice: 364000 },
  { name: 'Microondas 30L',         brand: 'LG',          model: 'MH6043DAR',       category: 'Electrodomésticos', price: 95000,  costPrice: 65000  },
  { name: 'Microondas 20L',         brand: 'Peabody',     model: 'PE-MO20B',        category: 'Electrodomésticos', price: 65000,  costPrice: 44000  },
  { name: 'Freezer Vertical 300L',  brand: 'Electrolux',  model: 'H300',            category: 'Electrodomésticos', price: 310000, costPrice: 217000 },
  { name: 'Aspiradora',             brand: 'Philips',     model: 'FC9729',          category: 'Electrodomésticos', price: 85000,  costPrice: 58000  },
];

async function run(): Promise<void> {
  const societyId = process.env['SEED_SOCIETY_ID'];
  if (!societyId) {
    throw new Error('Variable SEED_SOCIETY_ID requerida. Ejemplo: SEED_SOCIETY_ID=<uuid>');
  }

  const isProduction = process.env.NODE_ENV === 'production';

  const ds = new DataSource({
    type:        'postgres',
    host:        (process.env.DB_HOST ?? 'localhost').trim(),
    port:        parseInt((process.env.DB_PORT ?? '5432').trim(), 10),
    database:    (process.env.DB_NAME ?? 'canarias_dev').trim(),
    username:    (process.env.DB_USER ?? 'postgres').trim(),
    password:    (process.env.DB_PASS ?? '').trim(),
    ssl:         isProduction ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging:     false,
  });

  await ds.initialize();
  console.log('Conectado a la base de datos');

  let created = 0;
  let skipped = 0;

  for (const p of PRODUCTS) {
    const existing = await ds.query(
      `SELECT product_id FROM "PRODUCTS" WHERE name = $1 AND society_id = $2 LIMIT 1`,
      [p.name, societyId],
    );

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await ds.query(
      `INSERT INTO "PRODUCTS" (name, brand, model, category, price, cost_price, society_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')`,
      [p.name, p.brand, p.model, p.category, p.price, p.costPrice, societyId],
    );
    created++;
    console.log(`  + ${p.name}`);
  }

  await ds.destroy();
  console.log(`\nSeed completado: ${created} creados, ${skipped} ya existían.`);
}

run().catch(e => { console.error(e); process.exit(1); });
