import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const getDatabaseConfig = (
  configService: ConfigService
): TypeOrmModuleOptions => ({
  type: "postgres",
  host: configService.get<string>("DB_HOST"),
  port: configService.get<number>("DB_PORT"),
  database: configService.get<string>("DB_NAME"),
  username: configService.get<string>("DB_USER"),
  password: configService.get<string>("DB_PASS"),
  synchronize: configService.get<string>("NODE_ENV") === "development" || configService.get<string>('DB_SYNC') === 'true',
  logging: configService.get<string>("DB_LOGGING") === "true",
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/../database/migrations/*{.ts,.js}"],
  autoLoadEntities: true,
});
