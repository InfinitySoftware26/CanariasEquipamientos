# Bloque 1 — Diseño (pendiente de confirmación)

Estado: **propuesta**. No hay código implementado. Las referencias de línea
corresponden a la rama `feat/bloque-0b`.

---

## 1. Parámetros de negocio por sociedad

### 1.1 Valores hardcodeados encontrados

| Valor | Dónde | Qué hace | Propuesta |
|---|---|---|---|
| `SELLER_COMMISSION_RATE = 0.1` | `sales.service.ts:45` (usado en el cálculo de comisión, ~l.263) | Comisión del vendedor sobre el precio contado | Parámetro `seller_commission_rate`. La venta ya guarda `seller_commission_rate`, así que el histórico no cambia |
| Máximo de cuotas `100` | `sales.service.ts:241`; `installments.service.ts:658` (refinanciación) | Tope de cuotas | Parámetro `max_installments`. Además, unificar con `@Max(400)` de `create-sale.dto.ts:33` y `@Max(1000)` de los DTOs de planes y promociones (el DTO solo valida `>= 1`; el tope lo aplica el service) |
| Piso `-0.99` | `sales.service.ts:259` | Evita un total ≤ 0 con promociones negativas | **No parametrizar** hasta definir el signo de las promociones. Es una salvaguarda técnica |
| Tasa de mora por defecto | `SOCIETYS.default_daily_late_interest_rate` (migración 20260921) | Ya es por sociedad | Mover la lectura a la configuración; conservar la columna como fuente durante la transición |
| Recargo por transferencia | No existe | — | Parámetro `transfer_surcharge_rate`, default `0.21` |
| Control de stock | No existe stock en el modelo | — | Parámetro `stock_control_enabled` (default `false`), según BR-STOCK-007 |
| Stock mínimo | No existe | — | `min_stock_default` (sociedad), con override por producto cuando exista el modelo de stock |
| Días de alerta | No existe | — | `alert_days`. **A definir:** ¿alerta de qué? (cuota vencida hace N días, stock bajo, visita fallida) |
| Intervalos 7/14 días, `SALT_ROUNDS`, `perPage ≤ 100`, tasas 15/25/35% del seed | varios | Calendario, técnica, datos de prueba | No son parámetros de negocio; quedan como están |

### 1.2 Entidad

Tabla nueva `SOCIETY_SETTINGS`, 1:1 con `SOCIETYS`. Va en una tabla aparte y
no como columnas de `SOCIETYS`: separa permisos y auditoría del alta de la
sociedad, y evita seguir agrandando `SOCIETYS`.

| Columna | Tipo | Default | Validación |
|---|---|---|---|
| `society_id` | uuid PK | — | sociedad existente |
| `transfer_surcharge_rate` | numeric(6,4) NOT NULL | `0.2100` | 0 ≤ x ≤ 1 |
| `seller_commission_rate` | numeric(5,4) NOT NULL | `0.1000` | 0 ≤ x ≤ 1 |
| `max_installments` | integer NOT NULL | `100` | 1 ≤ x ≤ 400 |
| `default_daily_late_interest_rate` | numeric(12,6) NOT NULL | valor actual de SOCIETYS | 0 ≤ x ≤ 1 |
| `stock_control_enabled` | boolean NOT NULL | `false` | — |
| `min_stock_default` | integer NULL | NULL | ≥ 0 |
| `alert_days` | integer NULL | NULL (a definir) | ≥ 0 |
| `updated_by` | uuid NULL | — | — |
| `created_at` / `updated_at` | timestamptz | now() | — |

**Regla de snapshot:** toda operación que use un parámetro copia el valor
vigente en su propio registro (la venta ya lo hace con la comisión; el pago lo
hará con el recargo). Un cambio de configuración nunca recalcula el histórico.

### 1.3 Endpoints y roles

La ruta usa `:societyId`, para que el `SocietyGuard` existente compare la
sociedad del token sin código nuevo.

| Método | Ruta | Roles | Notas |
|---|---|---|---|
| GET | `/societies/:societyId/settings` | SUPER_ADMIN, MANAGER, ADMIN | MANAGER y ADMIN, solo su sociedad |
| PATCH | `/societies/:societyId/settings` | SUPER_ADMIN, MANAGER | DTO con class-validator, todos los campos opcionales |
| GET | `/societies/:societyId/settings/history` | SUPER_ADMIN, MANAGER | Auditoría |

`SocietySettingsService.get(societyId)` se inyecta en sales, payments e
installments (repositorio con interfaz `ISocietySettingsRepository`). Al
crear una sociedad (`SocietiesService.create`) se crea su fila con defaults.

### 1.4 Auditoría

`SOCIETY_SETTINGS_HISTORY` (`id`, `society_id`, `previous jsonb`,
`current jsonb`, `changed_by`, `changed_by_name`, `changed_at`), con el mismo
patrón que `CLIENT_HISTORY`. Se escribe en la misma transacción que el PATCH.

---

## 2. Registro único de cobros

### 2.1 Situación actual

| Camino | Crea PAYMENT | Medio de pago | Sociedad | Transacción |
|---|---|---|---|---|
| `PATCH /installments/:id/pay` → `InstallmentsService.payInstallment` | **No**: solo actualiza la cuota | No recibe | **No valida**; tampoco registra quién cobró | No |
| `POST /payments` → `PaymentsService.registerPayment` | Sí | `dto.method` | Toma la del token, pero **no valida** que `saleId`/`clientId` sean de la sociedad ni coherentes entre sí | No |
| Hoja de ruta → `RouteSheetItemsService` → `PaymentsService.registerFromCollection` | Sí | **Siempre CASH**: el DTO no tiene medio | Por la hoja | No |

Consecuencia: un cobro por `PATCH /installments/:id/pay` no aparece en
reportes de cobranza, no admite recibo y no queda auditado.

### 2.2 Propuesta

Un único `CollectionService.register(command, user)` en el módulo payments.
Es el **único** punto que crea un PAYMENT e imputa a cuotas.

```
RegisterCollectionCommand {
  installmentId?: uuid      // si falta: pago a cuenta, se imputa después
  saleId: uuid              // requerido si no hay installmentId
  baseAmount: number        // monto que cancela deuda (mora + capital)
  method: PaymentMethod
  source: 'manual' | 'installment' | 'route_sheet'
  routeSheetItemId?: uuid
  notes?: string
}
```

Pasos, todos en **una transacción** (`DataSource.transaction`):

1. Resolver venta y cuota con `societyScopeOf(user)` (404 en acceso cruzado).
   Verificar que la cuota sea de la venta y la venta, del cliente.
2. Bloquear la cuota (`SELECT … FOR UPDATE`) para evitar doble imputación
   concurrente.
3. Llevar la mora al día y validar `baseAmount ≤ capital pendiente + mora`.
4. Calcular el recargo según §3 con la tasa vigente de `SOCIETY_SETTINGS`.
5. Insertar PAYMENT con base, tasa, recargo y total.
6. Imputar: primero mora, después capital. La lógica de cálculo de
   `payInstallment` pasa a un método puro (sin I/O) que devuelve los nuevos
   valores de la cuota; el repositorio los persiste con el `EntityManager`
   de la transacción.
7. Insertar `PAYMENT_INSTALLMENT_APPLICATIONS`.

Los tres endpoints delegan en el servicio único:

- `POST /payments`: sin cambio de contrato; `amount` pasa a significar base.
- `POST /payments/:id/applications`: usa el mismo método de imputación.
- `PATCH /installments/:id/pay`: delega con `source='installment'`. Su DTO
  suma `method?: PaymentMethod` (opcional, default CASH durante la
  transición, con log de deprecación; después, obligatorio). Ahora sí crea un
  PAYMENT.
- Hoja de ruta: `UpdateRouteSheetItemDto` suma
  `@IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod`,
  obligatorio cuando `paymentReceived === true` o hay `collectedAmount`
  (validado con `@ValidateIf`). Durante la transición, default CASH.

---

## 3. Recargo por transferencia (21%)

### 3.1 Supuestos a validar con el negocio

| # | Supuesto | Estado |
|---|---|---|
| S1 | Aplica solo a `method = TRANSFER` | A validar. ¿Y `MIXED`? Propuesta: MIXED no admitido hasta definirlo (400) |
| S2 | La cuota se cancela por el monto base | A validar |
| S3 | El recargo se guarda aparte como ingreso | A validar: ¿en caja o solo en reportes? (ver §3.3) |
| S4 | La tasa vigente se guarda en el pago | Propuesto |
| S5 | El recargo se calcula sobre todo el monto base, **incluida la mora** imputada | **A validar** (alternativa: solo sobre capital) |
| S6 | El usuario ingresa el **monto base** y el sistema devuelve el total a cobrar | A validar. La alternativa (ingresar el total y despejar la base) genera diferencias de redondeo |

### 3.2 Cálculo y columnas (PAYMENTS)

```
surcharge_rate   = method == TRANSFER ? settings.transfer_surcharge_rate : 0
surcharge_amount = round2(base_amount * surcharge_rate)
amount (total)   = base_amount + surcharge_amount
```

| Columna | Tipo | Notas |
|---|---|---|
| `base_amount` | numeric(12,2) NOT NULL | Lo que se imputa a la cuota |
| `surcharge_rate` | numeric(6,4) NOT NULL DEFAULT 0 | Snapshot de la tasa |
| `surcharge_amount` | numeric(12,2) NOT NULL DEFAULT 0 | Ingreso por recargo |
| `amount` | existente | **Total recibido**. Se conserva el nombre para no romper lectores actuales (reportes, front). CHECK `amount = base_amount + surcharge_amount` |

Backfill de pagos existentes: `base_amount = amount`, tasa 0, recargo 0.

### 3.3 Impacto

- **Recibos.** Hoy `POST /receipts` toma `amount` del body y no valida
  `paymentId` contra la sociedad. Propuesta: el importe sale del PAYMENT, no
  del cliente, y el recibo muestra base, recargo (con la tasa) y total. El PDF
  (`receipt-pdf.util.ts`) suma dos líneas. Opcional: copiar base y recargo
  en RECEIPTS como snapshot.
- **Caja.** Hoy ningún cobro genera movimiento de caja (los movimientos son
  manuales). Una transferencia no entra a la caja física. Propuesta: no
  generar movimientos automáticos en este bloque; si se quieren, el recargo
  va como movimiento separado con concepto "Recargo transferencia" y
  `related_payment_id`. **A decidir.**
- **Reportes.** El reporte de cobranza (`reports.service.ts:98`) suma
  `amount`: desde ahora incluiría el recargo. Se agregan columnas base,
  recargo y total, y un subtotal por medio de pago. Las comisiones no cambian
  (se calculan sobre el precio contado de la venta).
- **Cierres y liquidaciones.** El total declarado por el cobrador debe
  compararse por medio de pago: las transferencias no las recibe en mano.

---

## 4. Esquema, migraciones, endpoints y riesgos

### 4.1 Migraciones previstas (nuevas, idempotentes, con `down()`)

1. `SOCIETY_SETTINGS` + `SOCIETY_SETTINGS_HISTORY`. Inserta una fila por
   sociedad existente con los defaults (`ON CONFLICT DO NOTHING`) y copia
   `default_daily_late_interest_rate` desde SOCIETYS.
2. PAYMENTS: `base_amount`, `surcharge_rate`, `surcharge_amount`, con
   backfill. Después, `NOT NULL` y el CHECK.
3. (Opcional) RECEIPTS: `base_amount`, `surcharge_amount`.
4. Stock: **fuera de este bloque**. No existe el modelo de stock, y
   `min_stock_default` y `stock_control_enabled` quedan solo como parámetros.

### 4.2 Endpoints afectados

- Nuevos: `GET/PATCH /societies/:societyId/settings`,
  `GET /societies/:societyId/settings/history`.
- Cambian: `POST /payments` (la respuesta suma campos),
  `POST /payments/:id/applications`, `PATCH /installments/:id/pay` (`method`
  y ahora crea un PAYMENT), `PATCH /route-sheet-items/:id` (`paymentMethod`),
  `POST /receipts` (el importe se deriva del pago), los reportes de cobranza
  (PDF/Excel) y `POST /sales` (lee comisión y tope de cuotas de la
  configuración).

### 4.3 Riesgos

| Riesgo | Mitigación |
|---|---|
| Hoy no hay transacciones: hay escrituras parciales si falla la imputación | Servicio único transaccional |
| Doble cobro concurrente de la misma cuota | `FOR UPDATE` sobre la cuota; el 23505 ya se traduce a 409 |
| Front sin `method` en hoja de ruta y en `/installments/:id/pay` | Default CASH temporal y deprecación anunciada |
| Cambio de semántica de `amount` en `POST /payments` | Documentar; `amount` del body = base |
| Redondeo de recargo con pagos parciales | Recargo por pago, `round2`; tests de bordes |
| Histórico de transferencias sin recargo | Backfill con 0; los reportes lo muestran explícito |
| `payInstallment` se usa directamente desde `PaymentsService.applyToInstallment` | Refactor a método puro; sin llamadas cruzadas |
| Endpoints de installments y payments **sin aislamiento por sociedad** (no estaban en el alcance del Bloque 0b) | Incluir el aislamiento en el Bloque 1, con el mismo patrón |
| MIXED sin definición | Rechazar hasta definirlo |
