import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  synchronize: true,
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/database/migrations/*.ts"],
});
