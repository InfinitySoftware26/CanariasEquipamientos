/**
 * Guardas compartidas por los seeds de desarrollo.
 */

/** Variable que habilita explícitamente un seed de desarrollo en producción. */
export const ALLOW_SEED_IN_PROD = 'ALLOW_SEED_IN_PROD';

/**
 * Lanza si NODE_ENV=production y no se pasó ALLOW_SEED_IN_PROD=true.
 * Se evalúa antes de conectarse a la base.
 */
export function assertDevSeedAllowed(seedName: string, env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== 'production') return;
  if (env[ALLOW_SEED_IN_PROD] === 'true') return;
  throw new Error(
    `[${seedName}] Se niega a correr con NODE_ENV=production: es un seed de ` +
      `desarrollo con datos ficticios. Para forzarlo, definir ${ALLOW_SEED_IN_PROD}=true.`,
  );
}
