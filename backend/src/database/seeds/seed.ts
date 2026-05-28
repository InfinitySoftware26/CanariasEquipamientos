/**
 * Seed script — crea el primer SUPER_ADMIN del sistema.
 *
 * Este script rompe intencionalmente el patron Repository porque corre fuera
 * del contexto de NestJS (sin DI container). Usa DataSource directamente,
 * lo cual es aceptable y estandar para scripts de inicializacion.
 *
 * Uso:
 *   pnpm run seed
 *
 * Variables de entorno requeridas (en .env):
 *   SEED_SUPERADMIN_NAME      — nombre completo
 *   SEED_SUPERADMIN_DNI       — DNI sin puntos
 *   SEED_SUPERADMIN_EMAIL     — email de acceso
 *   SEED_SUPERADMIN_PASSWORD  — contrasena inicial (cambiarla despues del primer login)
 *
 * Es idempotente: si el email ya existe, no realiza cambios.
 * Los SUPER_ADMINs adicionales tambien se crean con este script.
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';

const SALT_ROUNDS = 12;

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error('Variable de entorno requerida no encontrada: ' + key);
  }
  return value.trim();
}

async function run(): Promise<void> {
  const name     = requireEnv('SEED_SUPERADMIN_NAME');
  const dni      = requireEnv('SEED_SUPERADMIN_DNI');
  const email    = requireEnv('SEED_SUPERADMIN_EMAIL');
  const password = requireEnv('SEED_SUPERADMIN_PASSWORD');

  const dataSource = new DataSource({
    type:        'postgres',
    host:        process.env.DB_HOST ?? 'localhost',
    port:        parseInt(process.env.DB_PORT ?? '5432', 10),
    database:    process.env.DB_NAME ?? 'canarias_dev',
    username:    process.env.DB_USER ?? 'postgres',
    password:    process.env.DB_PASS ?? '',
    synchronize: false,
    logging:     false,
    entities:    [path.join(__dirname, '/../../**/*.entity{.ts,.js}')],
  });

  await dataSource.initialize();
  console.log('[seed] Conectado a la base de datos.');

  try {
    const [byEmail] = await dataSource.query(
      'SELECT staff_id FROM "STAFF" WHERE email = $1 LIMIT 1',
      [email],
    );
    if (byEmail) {
      console.log('[seed] El SUPER_ADMIN ' + email + ' ya existe. Sin cambios.');
      return;
    }

    const [byDni] = await dataSource.query(
      'SELECT staff_id FROM "STAFF" WHERE dni = $1 LIMIT 1',
      [dni],
    );
    if (byDni) {
      console.log('[seed] El DNI ' + dni + ' ya esta registrado. Sin cambios.');
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await dataSource.query(
      `INSERT INTO "STAFF"
         (staff_id, name, dni, email, password_hash, role, is_active, created_at, updated_at)
       VALUES
         (uuid_generate_v4(), $1, $2, $3, $4, 'super_admin', true, NOW(), NOW())`,
      [name, dni, email, passwordHash],
    );

    console.log('[seed] SUPER_ADMIN creado:');
    console.log('       Nombre: ' + name);
    console.log('       Email:  ' + email);
    console.log('       DNI:    ' + dni);
    console.log('[seed] IMPORTANTE: Cambia la contrasena despues del primer login.');
  } finally {
    await dataSource.destroy();
    console.log('[seed] Conexion cerrada.');
  }
}

run().catch((err: Error) => {
  console.error('[seed] Error:', err.message);
  process.exit(1);
});
