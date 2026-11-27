// /**
//  * Seed de sociedades ficticias para desarrollo y pruebas.
//  *
//  * Crea 4 sociedades, las vincula al SUPER_ADMIN (si existe) vía STAFF_SOCIETIES
//  * y genera la configuración de financiación por defecto para cada una.
//  * Es idempotente: identifica duplicados por tax_id.
//  *
//  * Uso:
//  *   pnpm exec ts-node -r tsconfig-paths/register src/database/seeds/societies-seed.ts
//  *
//  * Opcional — vincular a un SUPER_ADMIN específico:
//  *   SEED_SUPERADMIN_EMAIL=admin@empresa.com pnpm exec ts-node ...
//  */
// import 'dotenv/config';
// import { DataSource } from 'typeorm';
// import * as path from 'path';

// const SOCIETIES = [
//   {
//     name:         'Canarias Norte',
//     businessName: 'Canarias Norte S.A.',
//     taxId:        '30-71234567-1',
//     address:      'Av. del Libertador 1200, Buenos Aires',
//     phone:        '011-4555-1001',
//     email:        'norte@canarias.com.ar',
//   },
//   {
//     name:         'Canarias Sur',
//     businessName: 'Canarias Sur S.A.',
//     taxId:        '30-71234568-2',
//     address:      'Av. San Martín 850, Quilmes',
//     phone:        '011-4555-1002',
//     email:        'sur@canarias.com.ar',
//   },
//   {
//     name:         'Canarias Este',
//     businessName: 'Canarias Este S.R.L.',
//     taxId:        '30-71234569-3',
//     address:      'Ruta 2 Km 45, La Plata',
//     phone:        '0221-455-1003',
//     email:        'este@canarias.com.ar',
//   },
//   {
//     name:         'Canarias Oeste',
//     businessName: 'Canarias Oeste S.R.L.',
//     taxId:        '30-71234570-4',
//     address:      'Av. Rivadavia 3400, Morón',
//     phone:        '011-4455-1004',
//     email:        'oeste@canarias.com.ar',
//   },
// ];

// async function run(): Promise<void> {
//   const isProduction = process.env.NODE_ENV === 'production';

//   const ds = new DataSource({
//     type:        'postgres',
//     host:        (process.env.DB_HOST ?? 'localhost').trim(),
//     port:        parseInt((process.env.DB_PORT ?? '5432').trim(), 10),
//     database:    (process.env.DB_NAME ?? 'canarias_dev').trim(),
//     username:    (process.env.DB_USER ?? 'postgres').trim(),
//     password:    (process.env.DB_PASS ?? '').trim(),
//     ssl:         isProduction ? { rejectUnauthorized: false } : false,
//     synchronize: false,
//     logging:     false,
//     entities:    [path.join(__dirname, '/../../**/*.entity{.ts,.js}')],
//   });

//   await ds.initialize();
//   console.log('[societies-seed] Conectado a la base de datos.\n');

//   // Buscar SUPER_ADMIN si se pasó el email
//   const superAdminEmail = process.env.SEED_SUPERADMIN_EMAIL;
//   let superAdminId: string | null = null;

//   if (superAdminEmail) {
//     const [sa] = await ds.query(
//       `SELECT staff_id FROM "STAFF" WHERE email = $1 AND role = 'super_admin' LIMIT 1`,
//       [superAdminEmail],
//     );
//     superAdminId = sa?.staff_id ?? null;
//     if (superAdminId) {
//       console.log(`[societies-seed] SUPER_ADMIN encontrado: ${superAdminEmail} (${superAdminId})`);
//     } else {
//       console.warn(`[societies-seed] SUPER_ADMIN con email "${superAdminEmail}" no encontrado. Se crean las sociedades sin vincular.`);
//     }
//   } else {
//     // Tomar el primer SUPER_ADMIN que exista
//     const [sa] = await ds.query(
//       `SELECT staff_id, email FROM "STAFF" WHERE role = 'super_admin' LIMIT 1`,
//     );
//     if (sa) {
//       superAdminId = sa.staff_id;
//       console.log(`[societies-seed] SUPER_ADMIN detectado automáticamente: ${sa.email} (${superAdminId})`);
//     } else {
//       console.warn('[societies-seed] No hay SUPER_ADMIN en la BD. Las sociedades se crean sin asignación de staff.');
//     }
//   }

//   console.log('');
//   const societyIds: string[] = [];

//   for (const s of SOCIETIES) {
//     // Verificar si ya existe por tax_id
//     const [existing] = await ds.query(
//       `SELECT society_id FROM "SOCIETYS" WHERE tax_id = $1 LIMIT 1`,
//       [s.taxId],
//     );

//     let societyId: string;

//     if (existing?.society_id) {
//       societyId = existing.society_id;
//       console.log(`[societies-seed] Ya existe: ${s.name} (${societyId})`);
//     } else {
//       const [res] = await ds.query(
//         `INSERT INTO "SOCIETYS"
//            (society_id, name, business_name, tax_id, address, phone, email, status, created_at, updated_at)
//          VALUES
//            (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, 'active', NOW(), NOW())
//          RETURNING society_id`,
//         [s.name, s.businessName, s.taxId, s.address, s.phone, s.email],
//       );
//       societyId = res.society_id;
//       console.log(`[societies-seed] Creada: ${s.name} (${societyId})`);
//     }

//     societyIds.push(societyId);

//     // Vincular SUPER_ADMIN a la sociedad vía STAFF_SOCIETIES
//     if (superAdminId) {
//       const [linkExisting] = await ds.query(
//         `SELECT staff_society_id FROM "STAFF_SOCIETIES" WHERE staff_id = $1 AND society_id = $2 LIMIT 1`,
//         [superAdminId, societyId],
//       );

//       if (!linkExisting) {
//         await ds.query(
//           `INSERT INTO "STAFF_SOCIETIES"
//              (staff_society_id, staff_id, society_id, status, assigned_at)
//            VALUES
//              (uuid_generate_v4(), $1, $2, 'active', NOW())`,
//           [superAdminId, societyId],
//         );
//         console.log(`              → SUPER_ADMIN vinculado a ${s.name}`);
//       }
//     }

//     // Crear configuración de financiación por defecto si no existe
//     const [configExisting] = await ds.query(
//       `SELECT financing_config_id FROM "FINANCING_CONFIGURATIONS" WHERE society_id = $1 LIMIT 1`,
//       [societyId],
//     );

//     if (!configExisting) {
//       await ds.query(
//         `INSERT INTO "FINANCING_CONFIGURATIONS"
//            (financing_config_id, society_id, installments_3_rate, installments_6_rate, installments_9_rate, is_active, created_at, updated_at)
//          VALUES
//            (uuid_generate_v4(), $1, 0.15, 0.25, 0.35, true, NOW(), NOW())`,
//         [societyId],
//       );
//       console.log(`              → Configuración de financiación creada (3→15%, 6→25%, 9→35%)`);
//     }
//   }

//   console.log('\n─────────────────────────────────────────────────────');
//   console.log('[societies-seed] Listo. IDs de las sociedades creadas:\n');
//   SOCIETIES.forEach((s, i) => {
//     console.log(`  ${s.name.padEnd(20)} → ${societyIds[i]}`);
//   });
//   console.log('\nPara cargar productos en una sociedad:');
//   console.log(`  SEED_SOCIETY_ID=${societyIds[0]} pnpm exec ts-node -r tsconfig-paths/register src/database/seeds/products-seed.ts`);
//   console.log('─────────────────────────────────────────────────────\n');

//   await ds.destroy();
// }

// run().catch(e => {
//   console.error('[societies-seed] Error:', e?.message ?? e);
//   process.exit(1);
// });

/**
 * Seed de sociedades ficticias para desarrollo y pruebas.
 *
 * - Crea cuatro sociedades.
 * - Vincula el SUPER_ADMIN a las cuatro mediante STAFF_SOCIETIES.
 * - No crea configuraciones de financiación.
 * - Es idempotente: evita duplicados por tax_id y por staff_id + society_id.
 * - Ejecuta todos los cambios dentro de una transacción.
 *
 * Uso:
 * pnpm run seed:societies
 */

import 'dotenv/config';
import { DataSource, QueryRunner } from 'typeorm';
import * as path from 'path';

const SOCIETIES = [
  {
    name: 'Canarias Norte',
    businessName: 'Canarias Norte S.A.',
    taxId: '30-71234567-1',
    address: 'Av. del Libertador 1200, Buenos Aires',
    phone: '011-4555-1001',
    email: 'norte@canarias.com.ar',
  },
  {
    name: 'Canarias Sur',
    businessName: 'Canarias Sur S.A.',
    taxId: '30-71234568-2',
    address: 'Av. San Martín 850, Quilmes',
    phone: '011-4555-1002',
    email: 'sur@canarias.com.ar',
  },
  {
    name: 'Canarias Este',
    businessName: 'Canarias Este S.R.L.',
    taxId: '30-71234569-3',
    address: 'Ruta 2 Km 45, La Plata',
    phone: '0221-455-1003',
    email: 'este@canarias.com.ar',
  },
  {
    name: 'Canarias Oeste',
    businessName: 'Canarias Oeste S.R.L.',
    taxId: '30-71234570-4',
    address: 'Av. Rivadavia 3400, Morón',
    phone: '011-4455-1004',
    email: 'oeste@canarias.com.ar',
  },
];

const dataSource = new DataSource({
  type: 'postgres',
  host: (process.env.DB_HOST ?? 'localhost').trim(),
  port: parseInt((process.env.DB_PORT ?? '5432').trim(), 10),
  database: (process.env.DB_NAME ?? 'canarias_dev').trim(),
  username: (process.env.DB_USER ?? 'postgres').trim(),
  password: (process.env.DB_PASS ?? '').trim(),
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  synchronize: false,
  logging: false,
  entities: [path.join(__dirname, '/../../**/*.entity{.ts,.js}')],
});

async function findSuperAdmin(
  queryRunner: QueryRunner,
): Promise<{ staff_id: string; email: string }> {
  const configuredEmail = process.env.SEED_SUPERADMIN_EMAIL?.trim();

  let admins: Array<{ staff_id: string; email: string }>;

  if (configuredEmail) {
    admins = await queryRunner.query(
      `SELECT staff_id, email
       FROM "STAFF"
       WHERE LOWER(email) = LOWER($1)
         AND role = 'super_admin'
       LIMIT 1`,
      [configuredEmail],
    );
  } else {
    admins = await queryRunner.query(
      `SELECT staff_id, email
       FROM "STAFF"
       WHERE role = 'super_admin'
       ORDER BY created_at ASC
       LIMIT 1`,
    );
  }

  if (!admins.length) {
    throw new Error(
      configuredEmail
        ? `No se encontró un SUPER_ADMIN con el email ${configuredEmail}.`
        : 'No existe ningún usuario con rol SUPER_ADMIN.',
    );
  }

  return admins[0];
}

async function createOrFindSociety(
  queryRunner: QueryRunner,
  society: (typeof SOCIETIES)[number],
): Promise<{ societyId: string; created: boolean }> {
  const existing = await queryRunner.query(
    `SELECT society_id
     FROM "SOCIETYS"
     WHERE tax_id = $1
     LIMIT 1`,
    [society.taxId],
  );

  if (existing.length) {
    return {
      societyId: existing[0].society_id,
      created: false,
    };
  }

  const inserted = await queryRunner.query(
    `INSERT INTO "SOCIETYS"
       (
         society_id,
         name,
         business_name,
         tax_id,
         address,
         phone,
         email,
         status,
         created_at,
         updated_at
       )
     VALUES
       (
         uuid_generate_v4(),
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         'active',
         NOW(),
         NOW()
       )
     RETURNING society_id`,
    [
      society.name,
      society.businessName,
      society.taxId,
      society.address,
      society.phone,
      society.email,
    ],
  );

  return {
    societyId: inserted[0].society_id,
    created: true,
  };
}

async function linkSuperAdmin(
  queryRunner: QueryRunner,
  staffId: string,
  societyId: string,
): Promise<'created' | 'reactivated' | 'already_active'> {
  const existing = await queryRunner.query(
    `SELECT staff_society_id, status
     FROM "STAFF_SOCIETIES"
     WHERE staff_id = $1
       AND society_id = $2
     LIMIT 1`,
    [staffId, societyId],
  );

  if (existing.length) {
    if (existing[0].status !== 'active') {
      await queryRunner.query(
        `UPDATE "STAFF_SOCIETIES"
         SET status = 'active'
         WHERE staff_society_id = $1`,
        [existing[0].staff_society_id],
      );

      return 'reactivated';
    }

    return 'already_active';
  }

  await queryRunner.query(
    `INSERT INTO "STAFF_SOCIETIES"
       (
         staff_society_id,
         staff_id,
         society_id,
         status,
         assigned_at
       )
     VALUES
       (
         uuid_generate_v4(),
         $1,
         $2,
         'active',
         NOW()
       )`,
    [staffId, societyId],
  );

  return 'created';
}

async function run(): Promise<void> {
  let queryRunner: QueryRunner | undefined;
  let initialized = false;

  try {
    await dataSource.initialize();
    initialized = true;

    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log('[societies-seed] Conectado a la base de datos.');

    const superAdmin = await findSuperAdmin(queryRunner);

    const messages: string[] = [];

    messages.push(
      `SUPER_ADMIN encontrado: ${superAdmin.email}`,
    );

    const results: Array<{
      name: string;
      societyId: string;
    }> = [];

    for (const society of SOCIETIES) {
      const result = await createOrFindSociety(
        queryRunner,
        society,
      );

      messages.push(
        result.created
          ? `Sociedad creada: ${society.name}`
          : `Sociedad existente: ${society.name}`,
      );

      const linkResult = await linkSuperAdmin(
        queryRunner,
        superAdmin.staff_id,
        result.societyId,
      );

      if (linkResult === 'created') {
        messages.push(
          `  SUPER_ADMIN vinculado a ${society.name}`,
        );
      } else if (linkResult === 'reactivated') {
        messages.push(
          `  Vinculación reactivada para ${society.name}`,
        );
      } else {
        messages.push(
          `  Vinculación ya existente para ${society.name}`,
        );
      }

      results.push({
        name: society.name,
        societyId: result.societyId,
      });
    }

    await queryRunner.commitTransaction();

    console.log('\n' + messages.join('\n'));

    console.log(
      '\n[societies-seed] Proceso completado correctamente.',
    );

    console.log('\nSociedades:');

    for (const result of results) {
      console.log(
        `  ${result.name.padEnd(20)} → ${result.societyId}`,
      );
    }

    console.log(
      '\nNo se crearon configuraciones de financiación.',
    );
  } catch (error: any) {
    if (queryRunner?.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }

    console.error(
      '\n[societies-seed] Error. Se revirtieron los cambios.',
    );

    console.error(error?.message ?? error);

    throw error;
  } finally {
    if (queryRunner) {
      await queryRunner.release();
    }

    if (initialized) {
      await dataSource.destroy();
    }
  }
}

run().catch(() => {
  process.exitCode = 1;
});
