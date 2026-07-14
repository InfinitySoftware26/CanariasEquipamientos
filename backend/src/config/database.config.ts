import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>("NODE_ENV") ?? "development";
  const dbSync = configService.get<string>("DB_SYNC") === "true";
  const runMigrations =
    configService.get<string>("DB_RUN_MIGRATIONS") === "true";

  return {
    type: "postgres",
    host: configService.get<string>("DB_HOST"),
    port: configService.get<number>("DB_PORT"),
    database: configService.get<string>("DB_NAME"),
    username: configService.get<string>("DB_USER"),
    password: configService.get<string>("DB_PASS"),
    synchronize: nodeEnv !== "production" && dbSync,
    migrationsRun: nodeEnv === "production" || runMigrations,
    logging: configService.get<string>("DB_LOGGING") === "true",
    entities: [__dirname + "/../**/*.entity{.ts,.js}"],
    migrations: [__dirname + "/../database/migrations/*{.ts,.js}"],
    autoLoadEntities: true,
  };
};
