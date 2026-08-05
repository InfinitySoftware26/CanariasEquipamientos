import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { resolveDatabaseSsl } from "../config/database-ssl.util";

dotenv.config();

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
