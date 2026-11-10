# Runbook: despliegue de las migraciones del Bloque 0

Rama: `feat/bloque-0c` (incluye Bloque 0, 0b y 0c).
Estado de la base informado (consultas de solo lectura sobre Supabase):

- Todas las columnas `*_id` / `*_by` son `uuid`, salvo `SOCIETYS.tax_id` y
  `SUPPLIERS.tax_id` (varchar; CUIT, no son claves foráneas).
- `SALES` tiene 6 filas. `Sprint02Schema20260610000001` figura como ejecutada.
- La tabla `migrations` tiene 27 filas y llega hasta
  `MoveDocumentsChecklistToDelivery20260918000001`. Por `id`,
  `SocietyLateInterestDefault20260921000001` aparece antes que la de 20260918.

---

## 0. Bloqueantes previos (resolver antes de desplegar)

> **B1. La base corrió migraciones que no están en el repositorio.**
> `MoveDocumentsChecklistToDelivery20260918000001` no existe en ninguna rama
> de `origin`. El repo tiene 24 migraciones previas al Bloque 0 y la base
> tiene 27 filas, así que hay **al menos 3** migraciones aplicadas cuyo código
> no está en el repo. Riesgos:
> - El esquema real puede no coincidir con las entidades de esta rama (por el
>   nombre, `MoveDocumentsChecklistToDelivery` probablemente mueve las columnas
>   `dni_copy_received`, etc. de `SALE_VALIDATIONS`, que esta rama todavía
>   usa). Desplegar esta rama puede producir errores 500 en runtime.
> - `migration:revert` falla al llegar a una migración que no está en el
>   código (`MigrationExecutor.js:308-311`: *"No migration … was found in the
>   source code"*).
>
> Acción: recuperar ese código (rama local o máquina de quien desplegó) e
> integrarlo antes de desplegar este bloque.

> **B2. ¿Qué base usa el backend desplegado?** `render.yaml` define
> `DB_HOST` desde `fromDatabase: canarias-db` (Postgres de Render), no desde
> Supabase. Hay que confirmar en el panel de Render el valor efectivo de
> `DB_HOST`/`DB_NAME`. Este runbook vale para la base a la que apunte el
> servicio. Si no es la de Supabase, repetir las consultas de §1.1 sobre la
> base correcta.

---

## 1. Migraciones pendientes en el próximo arranque

### 1.1 Cómo calcular la lista exacta (solo lectura)

```sql
BEGIN TRANSACTION READ ONLY;
WITH repo(orden, name) AS (VALUES
  (1,'BaselinePreSprint02Schema20260501000000'),
  (2,'AddClientsHistory20260530120000'),
  (3,'GuardSprint02OnPopulatedSales20260609000001'),
  (4,'Sprint02Schema20260610000001'),
  (5,'FixSalesVarcharToUuid20260623000001'),
  (6,'FixStaffSocietiesAndStaffVarcharToUuid20260623000002'),
  (7,'EnsureSalesUuidColumns20260624000001'),
  (8,'Sprint03Schema20260703000001'),
  (9,'AddSellerCommissionToSales20260704000001'),
  (10,'AddClientReferenceFields20260705000001'),
  (11,'Sprint0406Schema20260803000001'),
  (12,'SupplierInvoicesSchema20260804000001'),
  (13,'ClientSurveyFieldsSchema20260816000001'),
  (14,'MakeFirstDueDateNullable20260817000002'),
  (15,'AddDailyBiweeklyToSalesAndInstallmentsFrequency20260817000003'),
  (16,'FinancingPlansPromotionsSchema20260823000001'),
  (17,'RenamePromotionProfitToDiscount20260825000001'),
  (18,'AddFinancingRateToPlansAndFixRates20260912000001'),
  (19,'CollectionAndFinancingEnhancements20260913000001'),
  (20,'EnhanceInstallments20260914000001'),
  (21,'MakeRouteSheetAssignedByNullable20260914000002'),
  (22,'AddDeliveryTrackingFields20260916000001'),
  (23,'AddEnvironmentalVisitDocuments20260917000001'),
  (24,'SocietyLateInterestDefault20260921000001'),
  (25,'Bloque0UuidColumnsAndUniqueIndexes20261110000001'),
  (26,'AddDeliveryDateToSales1754500000000'),
  (27,'AddDailyAndBiweeklyPaymentFrequency1755440000000'))
SELECT 'PENDIENTE (en repo, no en base)' AS estado, r.orden, r.name
  FROM repo r WHERE NOT EXISTS (SELECT 1 FROM migrations m WHERE m.name = r.name)
UNION ALL
SELECT 'EN BASE, NO EN REPO', NULL, m.name
  FROM migrations m WHERE NOT EXISTS (SELECT 1 FROM repo r WHERE r.name = m.name)
ORDER BY 1, 2;
ROLLBACK;
```

`orden` es el orden en que TypeORM las ejecuta: las ordena por los últimos
13 caracteres del nombre (`MigrationExecutor.js:430` y `:438`) y ejecuta
toda migración cuyo **nombre** no esté en la tabla, aunque su timestamp sea
anterior a las ya ejecutadas (`:154-164`; el chequeo de timestamp está
comentado en `:160-161`).

### 1.2 Lista esperada si las 24 previas figuran en la base

| # | Migración | Qué hace sobre esta base | Qué puede abortarla |
|---|---|---|---|
| 1 | `BaselinePreSprint02Schema20260501000000` | `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` (ya existe: no-op). Crea la tabla de registro `migration_baseline_20260501000000`. Las 4 tablas existen, así que no crea ninguna (el `CREATE TABLE "SOCIETYS"` con `tax_id` **no se ejecuta**). Crea cada enum de la lista **solo si falta** (`SOCIETYS_status_enum`, `STAFF_role_enum`, `SALES_payment_type_enum`, `SALES_status_enum`, `SALES_payment_frequency_enum`, `INSTALLMENTS_payment_frequency_enum`); si se crea alguno, queda sin uso. **No toca datos.** | Prácticamente nada: un tipo no-enum con alguno de esos nombres, o falta de permiso para `CREATE TYPE`/`CREATE TABLE` |
| 2 | `GuardSprint02OnPopulatedSales20260609000001` | Sprint02 figura como ejecutada, así que no hace nada. **No toca datos.** | Solo si Sprint02 **no** figurara en `migrations` con 6 filas en SALES. Con el estado informado, no aborta |
| 3 | `Bloque0UuidColumnsAndUniqueIndexes20261110000001` | Crea `migration_uuid_conversions_20261110000001` (vacía). Las 13 columnas de su lista ya son uuid, así que **no convierte nada**. No toca `tax_id` (test `bloque0-tax-id.spec.ts`). Crea `uq_daily_closures_staff_date_not_rejected` y `uq_cashbox_one_open_per_society`: `CREATE UNIQUE INDEX` sin `CONCURRENTLY` toma un lock de escritura breve sobre DAILY_CLOSURES y CASHBOX | **Duplicados**: dos cierres no rechazados del mismo cobrador y fecha, o más de una caja `open` por sociedad. Correr antes `docs/Data-Base/diagnostics/preflight-20261110000001.sql` |

`AddDeliveryDateToSales1754500000000` y
`AddDailyAndBiweeklyPaymentFrequency1755440000000` ordenan **al final**
(timestamp de 13 dígitos). Si alguna figurara como pendiente, ojo con
`1754500000000`: hace `ADD COLUMN "deliverydate"` **sin** `IF NOT EXISTS` y
falla si la columna ya existe.

---

## 2. Transacción y estado ante una falla

**Modo efectivo: `all` (una sola transacción para todas las pendientes).**

- Al arrancar, `migrationsRun` está activo con `NODE_ENV=production`
  (`src/config/database.config.ts`). TypeORM llama a
  `runMigrations({ transaction: this.options.migrationsTransactionMode })`
  (`node_modules/typeorm/data-source/DataSource.js:151-154`).
- `database.config.ts` no define `migrationsTransactionMode`, así que
  `runMigrations` usa el valor por defecto `"all"`
  (`DataSource.js:261-264`). `MigrationExecutor` también lo inicializa en
  `"all"` (`MigrationExecutor.js:28`).
- Por CLI (`migration:run`), `MigrationRunCommand.js:50-63` toma
  `dataSource.options.migrationsTransactionMode`, también ausente en
  `src/database/data-source.ts`, y por defecto `"all"`.
- En modo `all`: `startTransaction()` antes del bucle
  (`MigrationExecutor.js:215-219`). Cada `up()` y su `INSERT` en
  `migrations` corren dentro de esa transacción; el `commit` va al final
  (`:257-260`). Ante cualquier error, `rollbackTransaction()` (`:262-270`).

**Si una falla, la base queda exactamente como estaba**: no se crean los
índices, ni las tablas de registro, ni los enums, ni las filas en
`migrations`. Las tres migraciones son DDL transaccional en PostgreSQL. No
usan `CREATE INDEX CONCURRENTLY` ni `ALTER TYPE … ADD VALUE`.

**Efecto sobre el servicio:** el error se propaga a `DataSource.initialize`.
`@nestjs/typeorm` 10.0.2 reintenta la conexión 9 veces con 3 s de espera
(`node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js:101`), y cada
reintento repite y vuelve a revertir. Después el proceso termina y el
despliegue queda unhealthy. En Render, la versión anterior sigue sirviendo
si el health check del nuevo deploy no pasa; conviene verificarlo en el panel.

---

## 3. Verificación de `tax_id`

`src/database/migration-specs/bloque0-tax-id.spec.ts`: con
`information_schema` simulando **todas** las columnas como varchar, ni `up()`
ni `down()` emiten una consulta o sentencia que mencione `tax_id`,
`"SOCIETYS"` o `"SUPPLIERS"`, y las columnas inspeccionadas son solo `*_id`/
`*_by` de CLIENT, CLIENT_HISTORY, PRODUCTS y SALE_PRODUCTS. La lista es
explícita (`UUID_COLUMNS`), no un patrón.

---

## 4. Backup previo y reversión

### 4.1 Antes del deploy

1. **Preflight** (solo lectura): `preflight-20261110000001.sql` y §1.1. Las
   secciones 4 y 5 del preflight deben devolver 0 filas.
2. **Backup lógico completo:**
   - Supabase CLI:
     `supabase db dump --db-url "$DB_URL" -f backup-schema.sql` y
     `supabase db dump --db-url "$DB_URL" --data-only -f backup-data.sql`
   - o `pg_dump` directo (usar la conexión **directa**, puerto 5432, no el
     pooler en modo transacción):
     ```bash
     pg_dump "$DB_URL" --format=custom --no-owner --no-privileges \
       --file=canarias-$(date +%Y%m%d-%H%M).dump
     pg_restore --list canarias-*.dump | head   # verificar que el archivo es legible
     ```
   - Si el plan de Supabase tiene backups diarios o PITR, anotar la hora
     exacta previa al deploy.
3. Guardar también `SELECT * FROM migrations ORDER BY id` como CSV.

### 4.2 Si el deploy falla al arrancar

No hay nada que revertir en la base (rollback automático, §2). Corregir la
causa (normalmente duplicados del preflight) y redesplegar.

### 4.3 Si hay que revertir después de un deploy exitoso

Las tres migraciones nuevas quedan con los `id` más altos (28, 29 y 30,
insertadas en orden de timestamp). `migration:revert` revierte la de `id`
más alto (`MigrationExecutor.js:416`, orden por `id DESC`):

```bash
bash ./scripts/migrate.sh revert   # Bloque0: borra los 2 índices y su tabla de registro
bash ./scripts/migrate.sh revert   # Guardia: no hace cambios
bash ./scripts/migrate.sh revert   # Baseline: borra solo lo que creó (enums sin uso y su tabla de registro)
```

**No ejecutar un cuarto `revert`**: la siguiente por `id` sería una
migración que no está en el código (B1) y TypeORM fallaría.

### 4.4 Restauración total (último recurso)

`pg_restore --clean --if-exists --no-owner -d "$DB_URL" canarias-….dump`
sobre la base **con el servicio detenido**. Pierde todo lo escrito después
del backup. Preferir el revert de §4.3.
