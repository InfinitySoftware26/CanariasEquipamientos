/**
 * Resetea la contraseña de un staff por email.
 *
 * Uso:
 *   RESET_EMAIL=superadmin@canarias.com RESET_PASSWORD=NuevaPass123 pnpm exec ts-node -r tsconfig-paths/register src/database/seeds/reset-password.ts
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function run(): Promise<void> {
  const email    = process.env.RESET_EMAIL?.trim();
  const password = process.env.RESET_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error('Se requieren RESET_EMAIL y RESET_PASSWORD');
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
  console.log('[reset-password] Conectado.\n');

  const [staff] = await ds.query(
    `SELECT staff_id, name, email FROM "STAFF" WHERE email = $1 LIMIT 1`,
    [email],
  );

  if (!staff) {
    throw new Error(`No se encontró ningún usuario con email: ${email}`);
  }

  console.log(`[reset-password] Usuario encontrado: ${staff.name} (${staff.email})`);

  const hash = await bcrypt.hash(password, 12);
  await ds.query(
    `UPDATE "STAFF" SET password_hash = $1, updated_at = NOW() WHERE staff_id = $2`,
    [hash, staff.staff_id],
  );

  await ds.destroy();
  console.log(`[reset-password] Contraseña actualizada correctamente.`);
  console.log(`[reset-password] Email: ${email}`);
  console.log(`[reset-password] Nueva contraseña: ${password}`);
  console.log(`\n IMPORTANTE: Cambiá la contraseña después del primer login.`);
}

run().catch(e => {
  console.error('[reset-password] Error:', e?.message ?? e);
  process.exit(1);
});
