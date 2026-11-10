# Validación manual: migraciones sobre un Postgres vacío

Objetivo: comprobar que la cadena completa de migraciones (con la migración
base `20260501000000` y la guardia `20260609000001`) corre en una base vacía, y
medir la diferencia entre el esquema resultante y las entidades actuales.

> Usar **solo** un contenedor descartable. No apuntar estas variables a
> ninguna base compartida ni a producción.

## 1. Levantar un Postgres vacío y aislado

Misma versión mayor que `docker-compose.yml` (postgres:15):

```bash
docker run --rm -d --name canarias-pg-validate \
  -e POSTGRES_USER=validate -e POSTGRES_PASSWORD=validate -e POSTGRES_DB=canarias_validate \
  -p 55432:5432 postgres:15-alpine
```

## 2. Variables de entorno (solo para esta sesión de shell)

`src/database/data-source.ts` lee `.env` con dotenv, pero las variables ya
exportadas tienen prioridad (dotenv no las pisa).

```bash
cd backend
export DB_HOST=localhost DB_PORT=55432 DB_NAME=canarias_validate \
       DB_USER=validate DB_PASS=validate DB_SSL=false
```

## 3. Correr las migraciones

En Windows con Node 22, usar el script que cambia a Node 20 (ver
`scripts/migrate.sh`):

```bash
bash ./scripts/migrate.sh show   # todas deben figurar como pendientes [ ]
bash ./scripts/migrate.sh run
bash ./scripts/migrate.sh show   # todas deben figurar como ejecutadas [X]
```

Criterios de aceptación:

- `run` termina sin error.
- El orden del log empieza con `BaselinePreSprint02Schema20260501000000`,
  sigue `AddClientsHistory20260530120000`,
  `GuardSprint02OnPopulatedSales20260609000001`, `Sprint02Schema20260610000001`,
  y termina con `AddDeliveryDateToSales1754500000000` y
  `AddDailyAndBiweeklyPaymentFrequency1755440000000` (las dos con timestamp
  de 13 dígitos ordenan al final; ver informe del Bloque 0).
- `AddDailyBiweeklyToSalesAndInstallmentsFrequency20260817000003` corre sin
  error (antes fallaba porque los tipos no existían).

## 4. Diferencias contra las entidades (`schema:log`)

`scripts/migrate.sh` solo acepta `migration:*`; `schema:log` se corre directo
(con Node 20 activo):

```bash
node node_modules/ts-node/dist/bin.js -r tsconfig-paths/register \
  ./node_modules/typeorm/cli.js --dataSource src/database/data-source.ts \
  schema:log > ../schema-log-fresh.sql
```

Guardar la salida completa y clasificar cada sentencia:

| Categoría | Esperado | Acción |
|---|---|---|
| **A. Tablas de la migración base** (CLIENT, STAFF, SOCIETYS, SALES): columnas faltantes o con tipo distinto | No debería haber ninguna salvo las de C | Si aparece una, es un error de la base: reportar |
| **B. Nombre de enum**: `ALTER TYPE ... RENAME` o recreación de columnas enum | **Sí, preexistente.** Las migraciones crean tipos con nombre propio (`sale_status_enum`, `payment_frequency_enum`, `product_status_enum`, etc.) y las entidades no declaran `enumName`, así que TypeORM espera `"<TABLA>_<columna>_enum"` (`PostgresDriver.js:996`, `PostgresQueryRunner.js:2597-2601`) | Drift existente, no lo causa la base. Decidir aparte: `enumName` en entidades o migración de renombre |
| **C. Tipos uuid** de columnas que la base crea como varchar | No: las corrigen 20260623000001/2 y 20261110000001 | Si aparece, reportar |
| **D. Constraints/índices** con nombre distinto al de la naming strategy (índices `idx_*`, FKs `FK_sales_*`) | Probable, preexistente | Clasificar; no bloquea |
| **E. Columnas presentes solo vía synchronize** en otras tablas | Posible, preexistente | Listar: es la brecha de reproducibilidad pendiente |

El criterio "schema:log sin diferencias pendientes" **no se cumple hoy** por
las categorías B, D y E, que existen también en producción (Sprint02 y
siguientes ya corrieron allí). El criterio verificable para esta entrega es:
**cero sentencias de las categorías A y C**.

## 5. Probar la guardia (opcional, sobre el mismo contenedor)

```bash
# Simular "base nacida de synchronize con datos y sin historial":
bash ./scripts/migrate.sh revert   # repetir hasta revertir Sprint02 y la guardia
# Insertar una venta de prueba en SALES (forma pre-Sprint02) con psql y luego:
bash ./scripts/migrate.sh run      # debe abortar con [GuardSprint02] ... no se modificó nada
```

Revertir hasta ese punto ejecuta los `down()` de todas las migraciones
posteriores, lo que también sirve para probarlos.

## 6. Limpiar

```bash
docker stop canarias-pg-validate
unset DB_HOST DB_PORT DB_NAME DB_USER DB_PASS DB_SSL
```
