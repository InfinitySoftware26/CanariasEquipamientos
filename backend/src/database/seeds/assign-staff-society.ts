/**
 * Asigna una sociedad a los usuarios de prueba (gerente, administrativo, vendedor, cobrador)
 * y crea el vínculo en STAFF_SOCIETIES para que puedan seleccionar sociedad al loguear.
 *
 * Uso local contra Render:
 *   # Con sociedad específica:
 *   SEED_SOCIETY_ID=<uuid> pnpm run seed:assign-staff-society
 *
 *   # Sin SEED_SOCIETY_ID → usa la primera sociedad activa disponible
 *   pnpm run seed:assign-staff-society
 *
 * Variables de entorno necesarias (mismas que .env.render):
 *   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, NODE_ENV
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';

const TARGET_ROLES = ['gerente', 'administrativo', 'vendedor', 'cobrador'];

async function run(): Promise<void> {
  const isProduction = (process.env.NODE_ENV ?? '').trim() === 'production';

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
  console.log('[assign-staff-society] Conectado.\n');

  // ── 1. Determinar la sociedad destino ──────────────────────────────────────
  let societyId = (process.env.SEED_SOCIETY_ID ?? '').trim();
  let societyName = '';

  if (societyId) {
    const [soc] = await ds.query(
      `SELECT society_id, name FROM "SOCIETYS" WHERE society_id = $1 LIMIT 1`,
      [societyId],
    );
    if (!soc) {
      throw new Error(`No se encontró sociedad con ID: ${societyId}`);
    }
    societyName = soc.name;
  } else {
    const [soc] = await ds.query(
      `SELECT society_id, name FROM "SOCIETYS" WHERE status = 'active' ORDER BY name ASC LIMIT 1`,
    );
    if (!soc) {
      throw new Error('No hay sociedades activas en la base de datos. Corré seed:societies primero.');
    }
    societyId   = soc.society_id;
    societyName = soc.name;
  }

  console.log(`[assign-staff-society] Sociedad destino: ${societyName} (${societyId})\n`);

  // ── 2. Buscar staff con los roles de prueba ────────────────────────────────
  const staff: { staff_id: string; name: string; email: string; role: string; society_id: string | null }[] =
    await ds.query(
      `SELECT staff_id, name, email, role::text AS role, society_id
         FROM "STAFF"
        WHERE role::text = ANY($1::text[])
        ORDER BY role, name`,
      [TARGET_ROLES],
    );

  if (staff.length === 0) {
    console.log('[assign-staff-society] No se encontró ningún usuario con roles de prueba.');
    console.log('  Corré el dev-seed para crearlos primero.');
    await ds.destroy();
    return;
  }

  console.log(`[assign-staff-society] ${staff.length} usuario(s) encontrado(s):\n`);

  // ── 3. Para cada uno: actualizar society_id + upsert STAFF_SOCIETIES ───────
  for (const s of staff) {
    const prevSociety = s.society_id ?? '(ninguna)';

    // Actualizar society_id en STAFF si está vacío o es diferente
    if (s.society_id !== societyId) {
      await ds.query(
        `UPDATE "STAFF" SET society_id = $1, updated_at = NOW() WHERE staff_id = $2`,
        [societyId, s.staff_id],
      );
      console.log(`  ✓ ${s.role.padEnd(15)} ${s.email}`);
      console.log(`    society_id: ${prevSociety} → ${societyId}`);
    } else {
      console.log(`  · ${s.role.padEnd(15)} ${s.email}`);
      console.log(`    society_id ya asignada: ${societyId}`);
    }

    // Upsert STAFF_SOCIETIES (por si no existe el vínculo)
    const [link] = await ds.query(
      `SELECT staff_society_id FROM "STAFF_SOCIETIES"
        WHERE staff_id = $1 AND society_id = $2 LIMIT 1`,
      [s.staff_id, societyId],
    );

    if (!link) {
      await ds.query(
        `INSERT INTO "STAFF_SOCIETIES" (staff_society_id, staff_id, society_id, status, assigned_at)
         VALUES (uuid_generate_v4(), $1, $2, 'active', NOW())`,
        [s.staff_id, societyId],
      );
      console.log(`    STAFF_SOCIETIES: vínculo creado`);
    } else {
      console.log(`    STAFF_SOCIETIES: vínculo ya existía`);
    }

    console.log('');
  }

  await ds.destroy();
  console.log('[assign-staff-society] Listo.');
  console.log(`\nAhora estos usuarios pueden loguear y seleccionar "${societyName}".`);
}

run().catch(e => {
  console.error('[assign-staff-society] Error:', e?.message ?? e);
  process.exit(1);
});
