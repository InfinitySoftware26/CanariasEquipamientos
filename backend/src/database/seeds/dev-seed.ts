import "dotenv/config";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import * as path from "path";

const SALT_ROUNDS = 12;

async function run(): Promise<void> {
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT ?? "5432", 10),
    database: process.env.DB_NAME ?? "canarias_dev",
    username: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASS ?? "",
    synchronize: false,
    logging: false,
    entities: [path.join(__dirname, "/../../**/*.entity{.ts,.js}")],
  });

  await dataSource.initialize();
  console.log("[dev-seed] Conectado a DB");

  try {
    // Ensure a test society exists
    const societyRes = await dataSource.query(
      `SELECT society_id FROM "SOCIETYS" WHERE name = $1 LIMIT 1`,
      ["Seed Society"]
    );
    let societyId: string;
    if (societyRes[0]?.society_id) {
      societyId = societyRes[0].society_id;
      console.log("[dev-seed] Society existente:", societyId);
    } else {
      const res = await dataSource.query(
        `INSERT INTO "SOCIETYS" (society_id, name, business_name, tax_id, created_at, updated_at) VALUES (uuid_generate_v4(), $1, $2, $3, NOW(), NOW()) RETURNING society_id`,
        ["Seed Society", "Seed Society S.R.L.", "TAX-0000001"]
      );
      societyId = res[0].society_id;
      console.log("[dev-seed] Society creada:", societyId);
    }

    // Create manager
    const managerEmail = process.env.SEED_MANAGER_EMAIL ?? "manager@seed.local";
    const managerDni = process.env.SEED_MANAGER_DNI ?? "70000001";
    const managerPass = process.env.SEED_MANAGER_PASSWORD ?? "Pass1234";

    const [mEmail] = await dataSource.query(
      'SELECT staff_id FROM "STAFF" WHERE email=$1 LIMIT 1',
      [managerEmail]
    );
    if (!mEmail) {
      const hash = await bcrypt.hash(managerPass, SALT_ROUNDS);
      await dataSource.query(
        `INSERT INTO "STAFF" (staff_id, name, dni, email, password_hash, role, society_id, is_active, created_at, updated_at)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, 'gerente', $5, true, NOW(), NOW())`,
        ["Seed Manager", managerDni, managerEmail, hash, societyId]
      );
      console.log("[dev-seed] Manager creado:", managerEmail);
    } else console.log("[dev-seed] Manager ya existe");

    // Create admin
    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@seed.local";
    const adminDni = process.env.SEED_ADMIN_DNI ?? "70000002";
    const adminPass = process.env.SEED_ADMIN_PASSWORD ?? "Pass1234";

    const [aEmail] = await dataSource.query(
      'SELECT staff_id FROM "STAFF" WHERE email=$1 LIMIT 1',
      [adminEmail]
    );
    if (!aEmail) {
      const hash = await bcrypt.hash(adminPass, SALT_ROUNDS);
      await dataSource.query(
        `INSERT INTO "STAFF" (staff_id, name, dni, email, password_hash, role, society_id, is_active, created_at, updated_at)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, 'administrativo', $5, true, NOW(), NOW())`,
        ["Seed Admin", adminDni, adminEmail, hash, societyId]
      );
      console.log("[dev-seed] Admin creado:", adminEmail);
    } else console.log("[dev-seed] Admin ya existe");

    // Create seller
    const sellerEmail = process.env.SEED_SELLER_EMAIL ?? "seller@seed.local";
    const sellerDni = process.env.SEED_SELLER_DNI ?? "70000003";
    const sellerPass = process.env.SEED_SELLER_PASSWORD ?? "Pass1234";

    const [sEmail] = await dataSource.query(
      'SELECT staff_id FROM "STAFF" WHERE email=$1 LIMIT 1',
      [sellerEmail]
    );
    if (!sEmail) {
      const hash = await bcrypt.hash(sellerPass, SALT_ROUNDS);
      await dataSource.query(
        `INSERT INTO "STAFF" (staff_id, name, dni, email, password_hash, role, society_id, is_active, created_at, updated_at)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, 'vendedor', $5, true, NOW(), NOW())`,
        ["Seed Seller", sellerDni, sellerEmail, hash, societyId]
      );
      console.log("[dev-seed] Seller creado:", sellerEmail);
    } else console.log("[dev-seed] Seller ya existe");

    // Create a test client
    const clientDni = process.env.SEED_CLIENT_DNI ?? "90000001";
    const [cByDni] = await dataSource.query(
      'SELECT client_id FROM "CLIENT" WHERE document_number=$1 LIMIT 1',
      [clientDni]
    );
    if (!cByDni) {
      const res = await dataSource.query(
        `INSERT INTO "CLIENT" (client_id, name, surname, document_number, address, phone, email, society_id, created_at, updated_at)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING client_id`,
        [
          "Juan",
          "Seed",
          clientDni,
          "Calle Seed 123",
          "3410000000",
          "client@seed.local",
          societyId,
        ]
      );
      console.log("[dev-seed] Client creado:", res[0].client_id);
    } else console.log("[dev-seed] Client ya existe");

    console.log("[dev-seed] Seed finalizado.");
  } finally {
    await dataSource.destroy();
    console.log("[dev-seed] Conexion cerrada.");
  }
}

run().catch((err) => {
  console.error("[dev-seed] Error:", err?.message ?? err);
  process.exit(1);
});
