-- =============================================================================
-- Preflight de la migración Bloque0UuidColumnsAndUniqueIndexes20261110000001
-- -----------------------------------------------------------------------------
-- SOLO LECTURA (transacción READ ONLY + ROLLBACK).
-- Reproduce los chequeos con los que la migración aborta. En producción
-- migrationsRun está activo: si algo de esto devuelve filas, el deploy
-- fallará al arrancar. Correr antes de desplegar.
-- =============================================================================

BEGIN TRANSACTION READ ONLY;

-- 1. Columnas que la migración convertirá a uuid (tipo actual distinto de uuid).
SELECT table_name, column_name, data_type
  FROM information_schema.columns
 WHERE table_schema = current_schema()
   AND (table_name, column_name) IN (
     ('CLIENT','client_id'), ('CLIENT','zone_id'), ('CLIENT','society_id'),
     ('CLIENT','created_by'), ('CLIENT','updated_by'), ('CLIENT','verification_requested_by'),
     ('CLIENT_HISTORY','client_id'), ('CLIENT_HISTORY','performed_by'),
     ('PRODUCTS','product_id'), ('PRODUCTS','society_id'),
     ('SALE_PRODUCTS','sale_product_id'), ('SALE_PRODUCTS','sale_id'), ('SALE_PRODUCTS','product_id')
   )
   AND data_type <> 'uuid'
 ORDER BY table_name, column_name;

-- 2. Valores no UUID por columna (aborta si alguno > 0).
--    Si la columna ya es uuid el conteo es 0 por definición.
WITH re AS (SELECT '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'::text AS v)
SELECT * FROM (
  SELECT 'CLIENT' AS tabla, 'client_id' AS columna, COUNT(*) FILTER (WHERE client_id::text !~ re.v) AS invalidos FROM "CLIENT", re
  UNION ALL SELECT 'CLIENT','zone_id', COUNT(*) FILTER (WHERE zone_id IS NOT NULL AND zone_id::text !~ re.v) FROM "CLIENT", re
  UNION ALL SELECT 'CLIENT','society_id', COUNT(*) FILTER (WHERE society_id IS NOT NULL AND society_id::text !~ re.v) FROM "CLIENT", re
  UNION ALL SELECT 'CLIENT','created_by', COUNT(*) FILTER (WHERE created_by IS NOT NULL AND created_by::text !~ re.v) FROM "CLIENT", re
  UNION ALL SELECT 'CLIENT','updated_by', COUNT(*) FILTER (WHERE updated_by IS NOT NULL AND updated_by::text !~ re.v) FROM "CLIENT", re
  UNION ALL SELECT 'CLIENT','verification_requested_by', COUNT(*) FILTER (WHERE verification_requested_by IS NOT NULL AND verification_requested_by::text !~ re.v) FROM "CLIENT", re
  UNION ALL SELECT 'CLIENT_HISTORY','client_id', COUNT(*) FILTER (WHERE client_id IS NOT NULL AND client_id::text !~ re.v) FROM "CLIENT_HISTORY", re
  UNION ALL SELECT 'CLIENT_HISTORY','performed_by', COUNT(*) FILTER (WHERE performed_by IS NOT NULL AND performed_by::text !~ re.v) FROM "CLIENT_HISTORY", re
  UNION ALL SELECT 'PRODUCTS','product_id', COUNT(*) FILTER (WHERE product_id::text !~ re.v) FROM "PRODUCTS", re
  UNION ALL SELECT 'PRODUCTS','society_id', COUNT(*) FILTER (WHERE society_id IS NOT NULL AND society_id::text !~ re.v) FROM "PRODUCTS", re
  UNION ALL SELECT 'SALE_PRODUCTS','sale_product_id', COUNT(*) FILTER (WHERE sale_product_id::text !~ re.v) FROM "SALE_PRODUCTS", re
  UNION ALL SELECT 'SALE_PRODUCTS','sale_id', COUNT(*) FILTER (WHERE sale_id IS NOT NULL AND sale_id::text !~ re.v) FROM "SALE_PRODUCTS", re
  UNION ALL SELECT 'SALE_PRODUCTS','product_id', COUNT(*) FILTER (WHERE product_id IS NOT NULL AND product_id::text !~ re.v) FROM "SALE_PRODUCTS", re
) x
WHERE invalidos > 0;

-- 3. FKs sobre columnas no uuid de la lista (aborta si hay filas).
SELECT c.conname, a.attrelid::regclass AS tabla, a.attname AS columna, format_type(a.atttypid, a.atttypmod) AS tipo
  FROM pg_constraint c
  JOIN pg_attribute a
    ON (a.attrelid = c.conrelid  AND a.attnum = ANY (c.conkey))
    OR (a.attrelid = c.confrelid AND a.attnum = ANY (c.confkey))
 WHERE c.contype = 'f'
   AND a.attrelid IN ('"CLIENT"'::regclass, '"CLIENT_HISTORY"'::regclass, '"PRODUCTS"'::regclass, '"SALE_PRODUCTS"'::regclass)
   AND a.attname IN ('client_id','zone_id','society_id','created_by','updated_by',
                     'verification_requested_by','performed_by','product_id',
                     'sale_product_id','sale_id')
   AND format_type(a.atttypid, a.atttypmod) <> 'uuid';

-- 4. Duplicados que impiden uq_daily_closures_staff_date_not_rejected.
SELECT staff_id, closing_date, COUNT(*) AS n, array_agg(closure_id ORDER BY created_at) AS closures
  FROM "DAILY_CLOSURES"
 WHERE status <> 'rejected'
 GROUP BY staff_id, closing_date
HAVING COUNT(*) > 1
 ORDER BY closing_date DESC;

-- 5. Duplicados que impiden uq_cashbox_one_open_per_society.
SELECT society_id, COUNT(*) AS cajas_abiertas, array_agg(cashbox_id ORDER BY opening_date) AS cajas
  FROM "CASHBOX"
 WHERE status = 'open'
 GROUP BY society_id
HAVING COUNT(*) > 1;

ROLLBACK;
