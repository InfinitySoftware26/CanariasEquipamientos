import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

function resolveDatabaseSsl(host?: string, explicitSsl?: string): boolean {
  if (explicitSsl !== undefined) {
    return explicitSsl.toLowerCase() === "true";
  }

  if (!host) {
    return false;
  }

  const normalizedHost = host.toLowerCase();

  return (
    normalizedHost.includes("supabase") ||
    normalizedHost.includes("render.com") ||
    normalizedHost.includes("railway.app") ||
    normalizedHost.includes("neon.tech")
  );
}

export default new DataSource({
  type: "postgres",

  host: process.env.DB_HOST,

  port: parseInt(process.env.DB_PORT ?? "5432", 10),

  database: process.env.DB_NAME,

  username: process.env.DB_USER,

  password: process.env.DB_PASS,

  synchronize: false,

  entities: ["src/**/*.entity.ts"],

  migrations: ["src/database/migrations/*.ts"],

  ssl: resolveDatabaseSsl(process.env.DB_HOST, process.env.DB_SSL)
    ? {
        rejectUnauthorized: false,
      }
    : false,
});
