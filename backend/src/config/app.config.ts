import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const appConfig = registerAs('app', () => ({
  nodeEnv:     process.env.NODE_ENV ?? 'development',
  port:        parseInt(process.env.PORT ?? '3001', 10),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
}));

export function validateConfig(config: Record<string, unknown>) {
  const schema = Joi.object({
    NODE_ENV:               Joi.string().valid('development','production','test').default('development'),
    PORT:                   Joi.number().default(3001),
    FRONTEND_URL:           Joi.string().uri().required(),
    DB_HOST:                Joi.string().required(),
    DB_PORT:                Joi.number().default(5432),
    DB_NAME:                Joi.string().required(),
    DB_USER:                Joi.string().required(),
    DB_PASS:                Joi.string().required(),
    JWT_SECRET:             Joi.string().min(32).required(),
    JWT_EXPIRATION:         Joi.string().default('15m'),
    JWT_REFRESH_SECRET:     Joi.string().min(32).required(),
    JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
    MAIL_HOST:              Joi.string().required(),
    MAIL_PORT:              Joi.number().default(587),
    MAIL_USER:              Joi.string().email().required(),
    MAIL_PASS:              Joi.string().required(),
  }).unknown(true);
  const { error, value } = schema.validate(config);
  if (error) throw new Error('Config validation error: ' + error.message);
  return value;
}
