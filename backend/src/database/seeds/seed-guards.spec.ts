import { assertDevSeedAllowed } from './seed-guards';

// seed.js es JavaScript plano; se importa sin ejecutar run() (require.main).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const seedJs = require('./seed.js') as {
  assertProductionPasswords: () => void;
  seedPassword: (key: string) => string;
  SEED_PASSWORD_KEYS: string[];
};

describe('assertDevSeedAllowed (societies-seed)', () => {
  it('desarrollo → permitido', () => {
    expect(() => assertDevSeedAllowed('s', { NODE_ENV: 'development' })).not.toThrow();
  });

  it('producción sin flag → se niega', () => {
    expect(() => assertDevSeedAllowed('s', { NODE_ENV: 'production' })).toThrow(/ALLOW_SEED_IN_PROD=true/);
  });

  it.each(['1', 'TRUE', 'yes', ''])('producción con ALLOW_SEED_IN_PROD=%p → se niega', (flag) => {
    expect(() => assertDevSeedAllowed('s', { NODE_ENV: 'production', ALLOW_SEED_IN_PROD: flag })).toThrow();
  });

  it('producción con ALLOW_SEED_IN_PROD=true → permitido', () => {
    expect(() => assertDevSeedAllowed('s', { NODE_ENV: 'production', ALLOW_SEED_IN_PROD: 'true' })).not.toThrow();
  });
});

describe('seed.js — contraseñas en producción', () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });

  const setAll = () => seedJs.SEED_PASSWORD_KEYS.forEach((k) => (process.env[k] = 'S3gura!' + k));

  it('producción con todas las contraseñas → OK', () => {
    process.env.NODE_ENV = 'production';
    setAll();
    expect(() => seedJs.assertProductionPasswords()).not.toThrow();
    expect(seedJs.seedPassword('SEED_ADMIN_PASSWORD')).toBe('S3gura!SEED_ADMIN_PASSWORD');
  });

  it('producción sin una contraseña → falla y la nombra', () => {
    process.env.NODE_ENV = 'production';
    setAll();
    delete process.env.SEED_COLLECTOR_PASSWORD;
    process.env.SEED_SELLER_PASSWORD = '   ';
    expect(() => seedJs.assertProductionPasswords()).toThrow(/SEED_SELLER_PASSWORD, SEED_COLLECTOR_PASSWORD/);
    expect(() => seedJs.seedPassword('SEED_COLLECTOR_PASSWORD')).toThrow();
  });

  it('desarrollo sin contraseña → valor por defecto', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.SEED_MANAGER_PASSWORD;
    expect(() => seedJs.assertProductionPasswords()).not.toThrow();
    expect(seedJs.seedPassword('SEED_MANAGER_PASSWORD')).toBe('Pass1234!');
  });
});
