# Canarias System — Collections API

# Objetivo

Documentar el módulo de cobranzas del sistema.

El módulo será responsable de:

* gestión cuotas

* registro pagos

* cobranzas diarias

* recibos

* deuda clientes

* pagos parciales

* mora

* historial financiero

---

# Recursos de la API

El módulo de cobranzas se encuentra implementado mediante los siguientes recursos:

```http
/api/v1/installments
/api/v1/payments
```

No existe actualmente un controller con prefijo:

```http
/api/v1/collections
```

El concepto de Collections corresponde al módulo funcional de cobranzas, mientras que los recursos HTTP se encuentran separados entre cuotas (`installments`) y pagos (`payments`).

---

# Roles Permitidos

| Rol         | Acceso                                     |
| ----------- | ------------------------------------------ |
| ADMIN       | Operaciones administrativas y de cobranzas |
| COLLECTOR   | Operaciones de cobranza                    |
| MANAGER     | Consulta y operaciones habilitadas         |
| SELLER      | Acceso parcial según endpoint              |
| SUPER_ADMIN | Operaciones administrativas habilitadas    |

Los permisos concretos de cada endpoint se encuentran definidos mediante `RolesGuard` y `@Roles()`.

---

# Estados Cuotas

| Estado    | Descripción  |
| --------- | ------------ |
| PENDING   | Pendiente    |
| PAID      | Pagada       |
| OVERDUE   | Vencida      |
| PARTIAL   | Pago parcial |
| CANCELLED | Cancelada    |

---

# Endpoints

---

# Installments API

## Endpoint Base

```http
/api/v1/installments
```

---

# Obtener Cuotas Vencidas

## Endpoint

```http
GET /installments/overdue
```

## Roles

* ADMIN
* MANAGER
* COLLECTOR

## Descripción

Obtiene las cuotas vencidas correspondientes a la sociedad activa del usuario autenticado.

La sociedad se obtiene desde el contexto autenticado (`societyId`).

---

# Obtener Cuotas por Venta

## Endpoint

```http
GET /installments/sale/:saleId
```

## Autenticación

JWT obligatorio.

## Descripción

Obtiene las cuotas correspondientes a una venta determinada.

## Parámetros

| Parámetro | Tipo |
| --------- | ---- |
| saleId    | UUID |

---

# Obtener Cuotas por Cliente

## Endpoint

```http
GET /installments/client/:clientId
```

## Roles

* ADMIN
* MANAGER
* COLLECTOR

## Descripción

Obtiene las cuotas correspondientes a un cliente dentro de la sociedad activa.

## Parámetros

| Parámetro | Tipo |
| --------- | ---- |
| clientId  | UUID |

---

# Obtener Total Actual a Cobrar

## Endpoint

```http
GET /installments/:id/total-to-collect
```

## Roles

* ADMIN
* MANAGER
* COLLECTOR

## Descripción

Obtiene el monto actual a cobrar de una cuota.

La respuesta contempla el cálculo de:

* capital pendiente
* mora
* total actual a cobrar

---

# Actualizar Cuotas Vencidas

## Endpoint

```http
POST /installments/refresh-overdue
```

## Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

## Descripción

Actualiza las cuotas vencidas de la sociedad activa y calcula la mora correspondiente.

---

# Refinanciar Venta

## Endpoint

```http
POST /installments/sale/:saleId/refinance
```

## Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

## Descripción

Refinancia el saldo pendiente de una venta.

## Request

El cuerpo utiliza `RefinanceInstallmentsDto`.

La estructura exacta del request deberá mantenerse alineada con dicho DTO.

---

# Registrar Pago de Cuota

## Endpoint

```http
PATCH /installments/:id/pay
```

## Roles

* ADMIN
* MANAGER
* COLLECTOR

## Descripción

Registra un pago sobre una cuota.

El monto se imputa primero a la mora y posteriormente al capital.

## Request

```json
{
  "amount": 15000
}
```

## Validaciones

| Campo  | Regla          |
| ------ | -------------- |
| amount | numérico       |
| amount | mayor que cero |

---

# Modificar Fecha de Vencimiento

## Endpoint

```http
PATCH /installments/:id/due-date
```

## Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

## Descripción

Modifica la fecha de vencimiento de una cuota.

## Request

El cuerpo utiliza `UpdateInstallmentDateDto`.

## Response

```http
204 No Content
```

---

# Modificar Mora

## Endpoint

```http
PATCH /installments/:id/late-interest
```

## Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

## Descripción

Permite modificar manualmente la tasa y/o el monto de mora de una cuota.

## Request

El cuerpo utiliza `UpdateLateInterestDto`.

## Response

```http
204 No Content
```

---

# Payments API

## Endpoint Base

```http
/api/v1/payments
```

---

# Listar Pagos

## Endpoint

```http
GET /payments
```

## Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

## Query Params

| Parámetro | Tipo | Descripción                  |
| --------- | ---- | ---------------------------- |
| saleId    | UUID | Filtrar por venta            |
| clientId  | UUID | Filtrar por cliente          |
| staffId   | UUID | Filtrar por empleado         |
| from      | date | Fecha inicial (`YYYY-MM-DD`) |
| to        | date | Fecha final (`YYYY-MM-DD`)   |

## Descripción

Lista los pagos correspondientes a la sociedad activa.

Los filtros son opcionales.

---

# Obtener Pago

## Endpoint

```http
GET /payments/:id
```

## Autenticación

JWT obligatorio.

## Descripción

Obtiene el detalle de un pago.

## Parámetros

| Parámetro | Tipo |
| --------- | ---- |
| id        | UUID |

---

# Obtener Imputaciones de un Pago

## Endpoint

```http
GET /payments/:id/applications
```

## Autenticación

JWT obligatorio.

## Descripción

Obtiene las imputaciones correspondientes a las cuotas cubiertas por un pago.

## Parámetros

| Parámetro | Tipo |
| --------- | ---- |
| id        | UUID |

---

# Registrar Pago

## Endpoint

```http
POST /payments
```

## Roles

* ADMIN
* MANAGER
* COLLECTOR
* SUPER_ADMIN

## Descripción

Registra un pago.

El pago puede incluir una imputación automática a una cuota.

## Request

El cuerpo utiliza `CreatePaymentDto`.

La estructura exacta del request deberá mantenerse alineada con dicho DTO.

## Comportamiento de imputación

Cuando el request incluye una cuota, el pago puede ser imputado automáticamente a ella.

La imputación contempla:

1. mora
2. capital

---

# Imputación Manual de Pago

## Endpoint

```http
POST /payments/:id/applications
```

## Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

## Descripción

Permite imputar manualmente un pago a una o más cuotas.

## Request

El cuerpo utiliza `ApplyPaymentDto`.

## Validación

La suma de las imputaciones no puede superar el monto disponible del pago.

## Response

```http
204 No Content
```

---

# Pago desde Hoja de Ruta

El servicio de pagos contempla el registro de pagos originados desde una hoja de ruta mediante:

```text
registerFromCollection()
```

Este proceso utiliza:

* societyId
* staffId
* installmentId
* routeSheetItemId
* amount
* payment method
* notes

La operación registra el pago asociado a la cuota y a la hoja de ruta correspondiente.

---

# Estados Pago

| Estado    | Descripción     |
| --------- | --------------- |
| COMPLETED | Pago registrado |
| PARTIAL   | Pago parcial    |
| CANCELLED | Pago anulado    |

Estos estados forman parte de la documentación funcional del módulo.

---

# Pago Parcial

El sistema permite:

* pagos incompletos

* distribución del saldo

* actualización de deuda restante

La imputación se registra mediante `PaymentInstallmentApplication`.

---

# Generar Recibo

## Endpoint documentado previamente

```http
POST /collections/payments/:id/receipt
```

## Estado actual

Esta ruta **no se encuentra implementada en los controllers de Payments ni Installments revisados**.

Se conserva en la documentación porque forma parte del alcance original del módulo, pero no debe considerarse una ruta disponible de la API actual hasta que exista su controller correspondiente.

---

# Obtener Historial Cliente

## Endpoint documentado previamente

```http
GET /collections/clients/:id/history
```

## Estado actual

Esta ruta **no se encuentra implementada en los controllers de Payments ni Installments revisados**.

El historial financiero puede construirse actualmente mediante los recursos de cuotas y pagos disponibles, pero no existe un endpoint específico con esta ruta en los controllers revisados.

---

# Cuotas Vencidas

La funcionalidad existe actualmente mediante:

```http
GET /installments/overdue
```

No utiliza:

```http
GET /collections/overdue
```

## Roles

* ADMIN
* MANAGER
* COLLECTOR

---

# Seguridad

Todos los controllers del módulo utilizan:

```text
JwtAuthGuard
RolesGuard
SocietyGuard
```

Los endpoints requieren autenticación JWT.

El acceso se controla mediante roles.

La operación se encuentra asociada a la sociedad activa del usuario mediante `SocietyGuard` y `societyId`.

---

# Autorización

Los roles se asignan por endpoint mediante `@Roles()`.

Roles utilizados actualmente en el módulo:

* SUPER_ADMIN
* MANAGER
* ADMIN
* COLLECTOR

SELLER no posee actualmente permisos sobre los endpoints de `Installments` ni sobre las operaciones de `Payments` definidas en los controllers revisados.

---

# Paginación

El documento original establece que los listados deberán soportar:

* paginación
* filtros
* ordenamiento

Actualmente:

```http
GET /payments
```

implementa filtros mediante query parameters:

```text
saleId
clientId
staffId
from
to
```

Los controllers de `Installments` revisados no implementan actualmente parámetros de paginación.

Por lo tanto, la paginación queda documentada como requerimiento del módulo, pero no se presenta como funcionalidad actualmente implementada en estos controllers.

---

# Impacto Caja

El alcance original del módulo establece que todo pago aprobado deberá generar:

```text
cash_movement
```

La implementación de `PaymentsService` revisada registra el pago y realiza su imputación a cuotas, pero en el código proporcionado no aparece una llamada directa a un servicio de caja.

Por este motivo, el impacto en caja se conserva como parte del alcance documentado, sin afirmar desde esta API que la generación de `cash_movement` se realiza actualmente desde `PaymentsService`.

---

# Auditoría

El alcance original contempla registrar:

* cobrador

* fecha

* ubicación futura

* método pago

* modificaciones

En la implementación revisada, el pago registra actualmente información asociada a:

* `staffId`
* `paymentDate`
* `method`
* `notes`
* `societyId`
* `clientId`
* `saleId`
* `routeSheetItemId` cuando proviene de una hoja de ruta

La ubicación no forma parte de la implementación mostrada actualmente y queda como funcionalidad futura.

---

# Eliminación

Los pagos NO deberán eliminarse físicamente.

El alcance original establece:

```text
soft delete
```

La implementación de eliminación no aparece en los controllers proporcionados actualmente.

---

# Respuestas HTTP

Las operaciones de modificación que utilizan:

```http
204 No Content
```

son:

```http
PATCH /installments/:id/due-date
PATCH /installments/:id/late-interest
POST /payments/:id/applications
```

Las demás respuestas dependen directamente del objeto retornado por los servicios correspondientes.

---

# Escalabilidad Futura

Preparado para:

* pagos online

* QR

* Mercado Pago

* cobranza mobile

* firma digital recibos

* geolocalización cobranzas

---

# Estado

Documento actualizado Sprint 05.
Backend y Frontend operativos.
Integración Back ↔ Front operativa.