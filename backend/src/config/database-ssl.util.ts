/**
 * Supabase (y la mayoría de los proveedores remotos) exige SSL; localhost normalmente no lo soporta.
 * DB_SSL permite forzar el comportamiento explícitamente cuando el heurístico por host no aplica.
 */
export function resolveDatabaseSsl(host?: string, explicit?: string): boolean {
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;
  return !!host && host !== 'localhost' && host !== '127.0.0.1';
}
