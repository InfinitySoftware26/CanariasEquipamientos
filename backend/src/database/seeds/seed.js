/**
 * Seed script completo — crea datos de prueba para todos los roles.
 * JavaScript puro: no requiere ts-node ni dotenv-cli.
 *
 * Uso desde backend/:
 *   node src/database/seeds/seed.js .env.production
 *   node src/database/seeds/seed.js .env          (desarrollo local)
 *
 * Crea en orden:
 *   1. Sociedad de prueba
 *   2. SUPER_ADMIN
 *   3. MANAGER
 *   4. ADMIN
 *   5. SELLER
 *   6. COLLECTOR
 *   7. Zona de prueba
 *   8. CLIENT
 */

const { Client } = require('pg');
const bcrypt      = require('bcrypt');
const fs          = require('fs');
const path        = require('path');

const SALT_ROUNDS = 12;

// ─── Cargar .env manualmente ──────────────────────────────────────────────────
function loadEnv(envFile) {
  const filePath = path.resolve(process.cwd(), envFile);
  if (!fs.existsSync(filePath)) {
    throw new Error('Archivo de entorno no encontrado: ' + filePath);
  }
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key   = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();
    process.env[key] = value;
  }
}

function requireEnv(key) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error('Variable requerida no encontrada: ' + key);
  }
  return value.trim();
}

function getEnv(key, defaultValue) {
  return (process.env[key] || defaultValue).trim();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function emailExists(client, email) {
  const res = await client.query(
    'SELECT staff_id FROM "STAFF" WHERE email = $1 LIMIT 1', [email]
  );
  return res.rows.length > 0;
}

async function dniExists(client, table, dni) {
  const col = table === 'STAFF' ? 'dni' : 'dni';
  const idCol = table === 'STAFF' ? 'staff_id' : 'client_id';
  const res = await client.query(
    'SELECT ' + idCol + ' FROM "' + table + '" WHERE ' + col + ' = $1 LIMIT 1', [dni]
  );
  return res.rows.length > 0;
}

async function createStaff(db, { name, dni, email, password, role, societyId }) {
  if (await emailExists(db, email)) {
    console.log('  [skip] ' + role + ' — email ya existe: ' + email);
    return null;
  }
  if (await dniExists(db, 'STAFF', dni)) {
    console.log('  [skip] ' + role + ' — DNI ya existe: ' + dni);
    return null;
  }
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const res = await db.query(
    `INSERT INTO "STAFF"
       (staff_id, name, dni, email, password_hash, role, society_id, is_active, created_at, updated_at)
     VALUES
       (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW())
     RETURNING staff_id`,
    [name, dni, email, hash, role, societyId || null]
  );
  console.log('  [ok]   ' + role + ' — ' + email);
  return res.rows[0].staff_id;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function run() {
  const envFile = process.argv[2] || '.env';
  console.log('\n[seed] Cargando variables desde: ' + envFile);
  loadEnv(envFile);

  const db = new Client({
    host:     requireEnv('DB_HOST'),
    port:     parseInt(getEnv('DB_PORT', '5432'), 10),
    database: requireEnv('DB_NAME'),
    user:     requireEnv('DB_USER'),
    password: requireEnv('DB_PASS'),
    ssl:      process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  await db.connect();
  console.log('[seed] Conectado.\n');

  try {

    // ── 1. SOCIEDAD DE PRUEBA ──────────────────────────────────────────────
    console.log('[1/8] Sociedad de prueba...');
    let societyId;
    const existingSociety = await db.query(
      'SELECT society_id FROM "SOCIETYS" WHERE tax_id = $1 LIMIT 1',
      ['00-00000000-0']
    );
    if (existingSociety.rows.length > 0) {
      societyId = existingSociety.rows[0].society_id;
      console.log('  [skip] Sociedad ya existe.');
    } else {
      const res = await db.query(
        `INSERT INTO "SOCIETYS"
           (society_id, name, business_name, tax_id, status, created_at, updated_at)
         VALUES
           (uuid_generate_v4(), $1, $2, $3, 'active', NOW(), NOW())
         RETURNING society_id`,
        ['Canarias Seed', 'Canarias Equipamientos S.R.L.', '00-00000000-0']
      );
      societyId = res.rows[0].society_id;
      console.log('  [ok]   Sociedad creada: ' + societyId);
    }

    // ── 2. SUPER_ADMIN ─────────────────────────────────────────────────────
    console.log('\n[2/8] SUPER_ADMIN...');
    await createStaff(db, {
      name:      requireEnv('SEED_SUPERADMIN_NAME'),
      dni:       requireEnv('SEED_SUPERADMIN_DNI'),
      email:     requireEnv('SEED_SUPERADMIN_EMAIL'),
      password:  requireEnv('SEED_SUPERADMIN_PASSWORD'),
      role:      'super_admin',
      societyId: null,
    });

    // ── 3. MANAGER ─────────────────────────────────────────────────────────
    console.log('\n[3/8] MANAGER...');
    const managerId = await createStaff(db, {
      name:      'Manager Seed',
      dni:       getEnv('SEED_MANAGER_DNI', '70000001'),
      email:     getEnv('SEED_MANAGER_EMAIL', 'manager@seed.local'),
      password:  getEnv('SEED_MANAGER_PASSWORD', 'Pass1234!'),
      role:      'gerente',
      societyId,
    });

    // ── 4. ADMIN ───────────────────────────────────────────────────────────
    console.log('\n[4/8] ADMIN...');
    const adminId = await createStaff(db, {
      name:      'Admin Seed',
      dni:       getEnv('SEED_ADMIN_DNI', '70000002'),
      email:     getEnv('SEED_ADMIN_EMAIL', 'admin@seed.local'),
      password:  getEnv('SEED_ADMIN_PASSWORD', 'Pass1234!'),
      role:      'administrativo',
      societyId,
    });

    // ── 5. SELLER ──────────────────────────────────────────────────────────
    console.log('\n[5/8] SELLER...');
    await createStaff(db, {
      name:      'Vendedor Seed',
      dni:       getEnv('SEED_SELLER_DNI', '70000003'),
      email:     getEnv('SEED_SELLER_EMAIL', 'seller@seed.local'),
      password:  getEnv('SEED_SELLER_PASSWORD', 'Pass1234!'),
      role:      'vendedor',
      societyId,
    });

    // ── 6. COLLECTOR ───────────────────────────────────────────────────────
    console.log('\n[6/8] COLLECTOR...');
    await createStaff(db, {
      name:      'Cobrador Seed',
      dni:       getEnv('SEED_COLLECTOR_DNI', '70000004'),
      email:     getEnv('SEED_COLLECTOR_EMAIL', 'collector@seed.local'),
      password:  getEnv('SEED_COLLECTOR_PASSWORD', 'Pass1234!'),
      role:      'cobrador',
      societyId,
    });

    // ── 7. ZONA DE PRUEBA ──────────────────────────────────────────────────
    console.log('\n[7/8] Zona de prueba...');
    let zoneId;
    const existingZone = await db.query(
      'SELECT zone_id FROM "ZONES" WHERE society_id = $1 AND name = $2 LIMIT 1',
      [societyId, 'Zona Seed']
    );
    if (existingZone.rows.length > 0) {
      zoneId = existingZone.rows[0].zone_id;
      console.log('  [skip] Zona ya existe.');
    } else {
      const res = await db.query(
        `INSERT INTO "ZONES"
           (zone_id, society_id, name, description, status, created_at, updated_at)
         VALUES
           (uuid_generate_v4(), $1, $2, $3, 'active', NOW(), NOW())
         RETURNING zone_id`,
        [societyId, 'Zona Seed', 'Zona creada por el seed']
      );
      zoneId = res.rows[0].zone_id;
      console.log('  [ok]   Zona creada: ' + zoneId);
    }

    // ── 8. CLIENT ──────────────────────────────────────────────────────────
    console.log('\n[8/8] Cliente de prueba...');
    const clientDni   = getEnv('SEED_CLIENT_DNI',   '90000001');
    const clientEmail = getEnv('SEED_CLIENT_EMAIL',  'client@seed.local');

    const clientExists = await db.query(
      'SELECT client_id FROM "CLIENTS" WHERE dni = $1 LIMIT 1', [clientDni]
    );
    if (clientExists.rows.length > 0) {
      console.log('  [skip] Cliente ya existe.');
    } else {
      await db.query(
        `INSERT INTO "CLIENTS"
           (client_id, dni, name, email, phone, address, zone_id, staff_id,
            society_id, status, created_at, updated_at)
         VALUES
           (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW(), NOW())`,
        [
          clientDni,
          'Cliente Seed',
          clientEmail,
          '2990000000',
          'Direccion Seed 123',
          zoneId,
          adminId || managerId || null,
          societyId,
        ]
      );
      console.log('  [ok]   Cliente creado: ' + clientEmail);
    }

    // ── RESUMEN ────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(50));
    console.log('Seed completado. Credenciales de acceso:');
    console.log('='.repeat(50));
    console.log('SUPER_ADMIN  | ' + requireEnv('SEED_SUPERADMIN_EMAIL'));
    console.log('MANAGER      | ' + getEnv('SEED_MANAGER_EMAIL',   'manager@seed.local'));
    console.log('ADMIN        | ' + getEnv('SEED_ADMIN_EMAIL',     'admin@seed.local'));
    console.log('SELLER       | ' + getEnv('SEED_SELLER_EMAIL',    'seller@seed.local'));
    console.log('COLLECTOR    | ' + getEnv('SEED_COLLECTOR_EMAIL', 'collector@seed.local'));
    console.log('='.repeat(50));
    console.log('Todos los passwords estan en el .env de seed.');
    console.log('IMPORTANTE: Cambia las contrasenas en produccion.\n');

  } finally {
    await db.end();
    console.log('[seed] Conexion cerrada.');
  }
}

run().catch((err) => {
  console.error('\n[seed] Error:', err.message);
  process.exit(1);
});