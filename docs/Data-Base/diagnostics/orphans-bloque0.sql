-- =============================================================================
-- Diagnóstico de registros huérfanos — Bloque 0
-- -----------------------------------------------------------------------------
-- SOLO LECTURA. No crea claves foráneas, no modifica ni borra datos.
-- Toda la sesión corre en una transacción READ ONLY: cualquier escritura
-- accidental falla. Termina con ROLLBACK.
--
-- Tablas analizadas: PAYMENTS, CASH_MOVEMENTS, SETTLEMENTS, INSTALLMENTS.
-- Las comparaciones usan ::text en ambos lados porque en bases nacidas de
-- synchronize algunas columnas referenciadas (CLIENT, SALES, ...) pueden ser
-- varchar y la comparación uuid = varchar falla.
--
-- Uso:  psql "$DATABASE_URL" -f docs/Data-Base/diagnostics/orphans-bloque0.sql
--
-- Secciones:
--   1. Resumen de huérfanos por (tabla, columna → tabla referenciada).
--   2. Inconsistencias de sociedad (el registro y su referencia en sociedades
--      distintas): no son huérfanos, pero afectan el aislamiento por sociedad.
--   3. Detalle (primeros 50 IDs) de cada combinación con huérfanos.
--   0. Pre-chequeo: tablas referenciadas inexistentes (si falta alguna, la
--      sección 1 falla al mencionarla; comentar esa línea).
-- =============================================================================

BEGIN TRANSACTION READ ONLY;

-- ─── 0. Pre-chequeo de tablas ────────────────────────────────────────────────
SELECT t AS tabla, to_regclass(format('%I', t)) IS NOT NULL AS existe
FROM unnest(ARRAY[
  'PAYMENTS','CASH_MOVEMENTS','SETTLEMENTS','INSTALLMENTS',
  'SOCIETYS','CLIENT','SALES','STAFF','ROUTE_SHEET_ITEMS',
  'CASHBOX','SUPPLIER_PAYMENTS','DAILY_CLOSURES'
]) AS t
ORDER BY existe, tabla;

-- ─── 1. Resumen de huérfanos ─────────────────────────────────────────────────
-- Una fila por relación; huerfanos = filas con valor NO NULL que no existe
-- en la tabla referenciada.
WITH checks AS (
  -- PAYMENTS
  SELECT 'PAYMENTS' AS tabla, 'society_id' AS columna, 'SOCIETYS.society_id' AS referencia,
         COUNT(*) AS huerfanos
    FROM "PAYMENTS" p
   WHERE p.society_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "SOCIETYS" r WHERE r.society_id::text = p.society_id::text)
  UNION ALL
  SELECT 'PAYMENTS', 'client_id', 'CLIENT.client_id', COUNT(*)
    FROM "PAYMENTS" p
   WHERE p.client_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "CLIENT" r WHERE r.client_id::text = p.client_id::text)
  UNION ALL
  SELECT 'PAYMENTS', 'sale_id', 'SALES.sale_id', COUNT(*)
    FROM "PAYMENTS" p
   WHERE p.sale_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "SALES" r WHERE r.sale_id::text = p.sale_id::text)
  UNION ALL
  SELECT 'PAYMENTS', 'staff_id', 'STAFF.staff_id', COUNT(*)
    FROM "PAYMENTS" p
   WHERE p.staff_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "STAFF" r WHERE r.staff_id::text = p.staff_id::text)
  UNION ALL
  SELECT 'PAYMENTS', 'route_sheet_item_id', 'ROUTE_SHEET_ITEMS.item_id', COUNT(*)
    FROM "PAYMENTS" p
   WHERE p.route_sheet_item_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "ROUTE_SHEET_ITEMS" r WHERE r.item_id::text = p.route_sheet_item_id::text)

  -- CASH_MOVEMENTS
  UNION ALL
  SELECT 'CASH_MOVEMENTS', 'cashbox_id', 'CASHBOX.cashbox_id', COUNT(*)
    FROM "CASH_MOVEMENTS" m
   WHERE m.cashbox_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "CASHBOX" r WHERE r.cashbox_id::text = m.cashbox_id::text)
  UNION ALL
  SELECT 'CASH_MOVEMENTS', 'society_id', 'SOCIETYS.society_id', COUNT(*)
    FROM "CASH_MOVEMENTS" m
   WHERE m.society_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "SOCIETYS" r WHERE r.society_id::text = m.society_id::text)
  UNION ALL
  SELECT 'CASH_MOVEMENTS', 'staff_id', 'STAFF.staff_id', COUNT(*)
    FROM "CASH_MOVEMENTS" m
   WHERE m.staff_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "STAFF" r WHERE r.staff_id::text = m.staff_id::text)
  UNION ALL
  SELECT 'CASH_MOVEMENTS', 'related_payment_id', 'PAYMENTS.payment_id', COUNT(*)
    FROM "CASH_MOVEMENTS" m
   WHERE m.related_payment_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "PAYMENTS" r WHERE r.payment_id::text = m.related_payment_id::text)
  UNION ALL
  SELECT 'CASH_MOVEMENTS', 'related_supplier_payment_id', 'SUPPLIER_PAYMENTS.supplier_payment_id', COUNT(*)
    FROM "CASH_MOVEMENTS" m
   WHERE m.related_supplier_payment_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "SUPPLIER_PAYMENTS" r WHERE r.supplier_payment_id::text = m.related_supplier_payment_id::text)

  -- SETTLEMENTS
  UNION ALL
  SELECT 'SETTLEMENTS', 'closure_id', 'DAILY_CLOSURES.closure_id', COUNT(*)
    FROM "SETTLEMENTS" s
   WHERE s.closure_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "DAILY_CLOSURES" r WHERE r.closure_id::text = s.closure_id::text)
  UNION ALL
  SELECT 'SETTLEMENTS', 'staff_id', 'STAFF.staff_id', COUNT(*)
    FROM "SETTLEMENTS" s
   WHERE s.staff_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "STAFF" r WHERE r.staff_id::text = s.staff_id::text)
  UNION ALL
  SELECT 'SETTLEMENTS', 'society_id', 'SOCIETYS.society_id', COUNT(*)
    FROM "SETTLEMENTS" s
   WHERE s.society_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "SOCIETYS" r WHERE r.society_id::text = s.society_id::text)

  -- INSTALLMENTS (refinancing_group_id es un agrupador, no una referencia)
  UNION ALL
  SELECT 'INSTALLMENTS', 'sale_id', 'SALES.sale_id', COUNT(*)
    FROM "INSTALLMENTS" i
   WHERE i.sale_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "SALES" r WHERE r.sale_id::text = i.sale_id::text)
  UNION ALL
  SELECT 'INSTALLMENTS', 'client_id', 'CLIENT.client_id', COUNT(*)
    FROM "INSTALLMENTS" i
   WHERE i.client_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "CLIENT" r WHERE r.client_id::text = i.client_id::text)
  UNION ALL
  SELECT 'INSTALLMENTS', 'society_id', 'SOCIETYS.society_id', COUNT(*)
    FROM "INSTALLMENTS" i
   WHERE i.society_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "SOCIETYS" r WHERE r.society_id::text = i.society_id::text)
)
SELECT tabla, columna, referencia, huerfanos
  FROM checks
 ORDER BY huerfanos DESC, tabla, columna;

-- ─── 2. Inconsistencias de sociedad ──────────────────────────────────────────
SELECT 'PAYMENTS vs SALES' AS relacion, COUNT(*) AS filas
  FROM "PAYMENTS" p JOIN "SALES" s ON s.sale_id::text = p.sale_id::text
 WHERE p.society_id::text IS DISTINCT FROM s.society_id::text
UNION ALL
SELECT 'PAYMENTS vs CLIENT', COUNT(*)
  FROM "PAYMENTS" p JOIN "CLIENT" c ON c.client_id::text = p.client_id::text
 WHERE c.society_id IS NOT NULL
   AND p.society_id::text IS DISTINCT FROM c.society_id::text
UNION ALL
SELECT 'CASH_MOVEMENTS vs CASHBOX', COUNT(*)
  FROM "CASH_MOVEMENTS" m JOIN "CASHBOX" b ON b.cashbox_id::text = m.cashbox_id::text
 WHERE m.society_id::text IS DISTINCT FROM b.society_id::text
UNION ALL
SELECT 'SETTLEMENTS vs DAILY_CLOSURES', COUNT(*)
  FROM "SETTLEMENTS" st JOIN "DAILY_CLOSURES" d ON d.closure_id::text = st.closure_id::text
 WHERE st.society_id::text IS DISTINCT FROM d.society_id::text
UNION ALL
SELECT 'INSTALLMENTS vs SALES', COUNT(*)
  FROM "INSTALLMENTS" i JOIN "SALES" s ON s.sale_id::text = i.sale_id::text
 WHERE i.society_id::text IS DISTINCT FROM s.society_id::text
ORDER BY filas DESC;

-- ─── 3. Detalle (primeros 50 por relación) ───────────────────────────────────
-- Ejecutar solo las que en la sección 1 dieron huerfanos > 0.

SELECT 'PAYMENTS.sale_id' AS relacion, p.payment_id AS id, p.sale_id::text AS valor, p.created_at
  FROM "PAYMENTS" p
 WHERE p.sale_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM "SALES" r WHERE r.sale_id::text = p.sale_id::text)
 ORDER BY p.created_at LIMIT 50;

SELECT 'PAYMENTS.client_id' AS relacion, p.payment_id AS id, p.client_id::text AS valor, p.created_at
  FROM "PAYMENTS" p
 WHERE p.client_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM "CLIENT" r WHERE r.client_id::text = p.client_id::text)
 ORDER BY p.created_at LIMIT 50;

SELECT 'PAYMENTS.route_sheet_item_id' AS relacion, p.payment_id AS id, p.route_sheet_item_id::text AS valor, p.created_at
  FROM "PAYMENTS" p
 WHERE p.route_sheet_item_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM "ROUTE_SHEET_ITEMS" r WHERE r.item_id::text = p.route_sheet_item_id::text)
 ORDER BY p.created_at LIMIT 50;

SELECT 'CASH_MOVEMENTS.cashbox_id' AS relacion, m.movement_id AS id, m.cashbox_id::text AS valor, m.created_at
  FROM "CASH_MOVEMENTS" m
 WHERE m.cashbox_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM "CASHBOX" r WHERE r.cashbox_id::text = m.cashbox_id::text)
 ORDER BY m.created_at LIMIT 50;

SELECT 'CASH_MOVEMENTS.related_payment_id' AS relacion, m.movement_id AS id, m.related_payment_id::text AS valor, m.created_at
  FROM "CASH_MOVEMENTS" m
 WHERE m.related_payment_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM "PAYMENTS" r WHERE r.payment_id::text = m.related_payment_id::text)
 ORDER BY m.created_at LIMIT 50;

SELECT 'CASH_MOVEMENTS.related_supplier_payment_id' AS relacion, m.movement_id AS id, m.related_supplier_payment_id::text AS valor, m.created_at
  FROM "CASH_MOVEMENTS" m
 WHERE m.related_supplier_payment_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM "SUPPLIER_PAYMENTS" r WHERE r.supplier_payment_id::text = m.related_supplier_payment_id::text)
 ORDER BY m.created_at LIMIT 50;

SELECT 'SETTLEMENTS.closure_id' AS relacion, s.settlement_id AS id, s.closure_id::text AS valor, s.created_at
  FROM "SETTLEMENTS" s
 WHERE s.closure_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM "DAILY_CLOSURES" r WHERE r.closure_id::text = s.closure_id::text)
 ORDER BY s.created_at LIMIT 50;

SELECT 'INSTALLMENTS.sale_id' AS relacion, i.installment_id AS id, i.sale_id::text AS valor, i.created_at
  FROM "INSTALLMENTS" i
 WHERE i.sale_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM "SALES" r WHERE r.sale_id::text = i.sale_id::text)
 ORDER BY i.created_at LIMIT 50;

SELECT 'INSTALLMENTS.client_id' AS relacion, i.installment_id AS id, i.client_id::text AS valor, i.created_at
  FROM "INSTALLMENTS" i
 WHERE i.client_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM "CLIENT" r WHERE r.client_id::text = i.client_id::text)
 ORDER BY i.created_at LIMIT 50;

-- staff_id / society_id: si la sección 1 los reporta, reutilizar el patrón
-- anterior cambiando columna y tabla referenciada.

ROLLBACK;
