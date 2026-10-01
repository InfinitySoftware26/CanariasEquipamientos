# Canarias System — API — Payments

**Documento actualizado Sprint 05**

---

# 1. Objetivo

Documentar los endpoints actualmente implementados para el módulo **Payments**, responsable del registro de pagos realizados por clientes y de su imputación a cuotas.

El módulo permite:

* registrar pagos;
* consultar pagos;
* filtrar pagos por sociedad, venta, cliente, empleado y período;
* consultar el detalle de un pago;
* consultar las cuotas afectadas por un pago;
* imputar manualmente un pago a una o más cuotas;
* registrar pagos originados desde el flujo de cobranzas mediante integración interna con Route Sheets.

---

# 2. Base URL

Todos los endpoints se encuentran bajo:

```text
/api/v1/payments
```

Requieren autenticación mediante JWT.

El acceso se encuentra protegido mediante:

```text
JwtAuthGuard
RolesGuard
SocietyGuard
```

La sociedad se obtiene del usuario autenticado.

---

# 3. Métodos de pago

El backend actualmente define los siguientes métodos:

```text
cash
card
transfer
check
mixed
```

Enum correspondiente:

```ts
PaymentMethod
```

Archivo:

```text
backend/src/common/enums/payment-method.enum.ts
```

---

# 4. GET /payments

## Objetivo

Obtener los pagos registrados dentro de la sociedad activa.

## Roles

```text
ADMIN
MANAGER
SUPER_ADMIN
```

## Query Parameters

Todos son opcionales:

| Parámetro  | Tipo       | Descripción                              |
| ---------- | ---------- | ---------------------------------------- |
| `saleId`   | UUID       | Filtra por venta                         |
| `clientId` | UUID       | Filtra por cliente                       |
| `staffId`  | UUID       | Filtra por empleado que registró el pago |
| `from`     | YYYY-MM-DD | Fecha inicial                            |
| `to`       | YYYY-MM-DD | Fecha final                              |

## Ejemplo

```http
GET /api/v1/payments?saleId=SALE_UUID
```

O:

```http
GET /api/v1/payments?clientId=CLIENT_UUID&from=2026-09-01&to=2026-09-30
```

## Comportamiento

El backend obtiene la sociedad desde:

```text
CurrentUser.societyId
```

No se recibe `societyId` desde el frontend.

Los resultados se ordenan por fecha de pago descendente.

---

# 5. GET /payments/:id

## Objetivo

Obtener el detalle de un pago.

## Parámetro

```text
id
```

UUID del pago.

## Ejemplo

```http
GET /api/v1/payments/PAYMENT_UUID
```

## Respuesta

El recurso corresponde a la entidad `Payment`.

Actualmente contiene:

```json
{
  "paymentId": "uuid",
  "societyId": "uuid",
  "clientId": "uuid",
  "saleId": "uuid",
  "staffId": "uuid",
  "routeSheetItemId": "uuid",
  "amount": 15000,
  "method": "cash",
  "paymentDate": "2026-09-25T15:30:00.000Z",
  "notes": "Pago realizado",
  "createdAt": "2026-09-25T15:30:00.000Z",
  "updatedAt": "2026-09-25T15:30:00.000Z"
}
```

---

# 6. GET /payments/:id/applications

## Objetivo

Consultar las imputaciones de un pago.

Permite conocer qué cuotas fueron cubiertas mediante el pago.

## Ejemplo

```http
GET /api/v1/payments/PAYMENT_UUID/applications
```

## Concepto

Un pago puede estar relacionado con una o varias imputaciones.

La relación se almacena en:

```text
PAYMENT_INSTALLMENT_APPLICATIONS
```

Cada imputación contiene:

```text
applicationId
paymentId
installmentId
appliedAmount
createdAt
```

---

# 7. POST /payments

## Objetivo

Registrar un nuevo pago.

El endpoint permite registrar el pago y, opcionalmente, imputarlo automáticamente a una cuota.

## Roles

```text
ADMIN
MANAGER
COLLECTOR
SUPER_ADMIN
```

## Request

```http
POST /api/v1/payments
Content-Type: application/json
Authorization: Bearer <token>
```

## Body

```json
{
  "saleId": "SALE_UUID",
  "clientId": "CLIENT_UUID",
  "amount": 15000,
  "method": "cash",
  "installmentId": "INSTALLMENT_UUID",
  "notes": "Pago de cuota"
}
```

## Campos

| Campo           | Tipo          | Obligatorio | Descripción                     |
| --------------- | ------------- | ----------: | ------------------------------- |
| `saleId`        | UUID          |          Sí | Venta asociada                  |
| `clientId`      | UUID          |          Sí | Cliente que realiza el pago     |
| `amount`        | number        |          Sí | Monto cobrado                   |
| `method`        | PaymentMethod |          Sí | Forma de pago                   |
| `installmentId` | UUID          |          No | Cuota a imputar automáticamente |
| `notes`         | string        |          No | Observaciones                   |

## Validaciones

### `saleId`

Debe ser un UUID válido.

### `clientId`

Debe ser un UUID válido.

### `amount`

Debe ser numérico y mayor que cero.

### `method`

Debe corresponder a uno de los valores definidos por `PaymentMethod`.

### `installmentId`

Si se informa, debe ser un UUID válido.

Cuando se informa:

```text
payment.amount
        ↓
imputación automática
        ↓
installmentId
```

La imputación se realiza por el monto total del pago.

---

# 8. Comportamiento interno de POST /payments

Al registrar un pago, el backend genera:

```text
societyId
```

a partir del usuario autenticado.

También registra:

```text
clientId
saleId
staffId
amount
method
paymentDate
notes
```

El empleado que registra el pago se obtiene del usuario autenticado:

```text
CurrentUser.sub
```

No debe enviarse `staffId` desde el frontend.

---

# 9. Imputación automática

Cuando el request contiene:

```json
{
  "installmentId": "INSTALLMENT_UUID"
}
```

el backend registra primero el pago y posteriormente realiza la imputación a la cuota indicada.

La imputación se realiza mediante el servicio de cuotas.

Actualmente el proceso considera el total pendiente de la cuota y utiliza la lógica existente de `InstallmentsService`.

---

# 10. POST /payments/:id/applications

## Objetivo

Realizar manualmente la imputación de un pago a una o más cuotas.

## Roles

```text
ADMIN
MANAGER
SUPER_ADMIN
```

## Request

```http
POST /api/v1/payments/PAYMENT_UUID/applications
Content-Type: application/json
Authorization: Bearer <token>
```

## Body

```json
{
  "applications": [
    {
      "installmentId": "INSTALLMENT_UUID",
      "amount": 10000
    }
  ]
}
```

## Múltiples cuotas

Un mismo pago puede imputarse a varias cuotas:

```json
{
  "applications": [
    {
      "installmentId": "INSTALLMENT_1_UUID",
      "amount": 10000
    },
    {
      "installmentId": "INSTALLMENT_2_UUID",
      "amount": 5000
    }
  ]
}
```

## Validaciones

Debe existir al menos una imputación.

Cada elemento debe contener:

```text
installmentId
amount
```

El monto debe ser positivo.

La suma de las nuevas imputaciones, más las imputaciones existentes del pago, no puede superar el monto registrado en el pago.

---

# 11. Pagos originados desde Cobranzas

El módulo Payments contiene una operación interna:

```text
PaymentsService.registerFromCollection(...)
```

Esta operación permite registrar pagos originados desde el flujo de cobranza.

Recibe internamente:

```text
societyId
staffId
amount
installmentId
routeSheetItemId
method
notes
```

El servicio:

1. obtiene la cuota;
2. obtiene el total actual a cobrar;
3. valida que el monto sea mayor a cero;
4. valida que no supere el total pendiente;
5. registra el Payment;
6. asocia el `routeSheetItemId`;
7. imputa el pago a la cuota.

Esta operación es **interna entre módulos**.

No existe actualmente un endpoint independiente:

```text
POST /payments/from-collection
```

Por lo tanto, no debe documentarse como una ruta HTTP.

---

# 12. Relación con Route Sheets

Cuando un pago se origina desde una cobranza realizada mediante una hoja de ruta, el Payment puede conservar:

```text
routeSheetItemId
```

Esto permite mantener la trazabilidad entre:

```text
Route Sheet Item
        ↓
Payment
        ↓
Installment
```

El `RouteSheetItem` no registra directamente la lógica financiera del pago.

La operación de registro pertenece al módulo Payments.

---

# 13. Relación con Installments

Payments utiliza:

```text
InstallmentsService
```

para realizar las imputaciones.

El pago puede afectar:

* capital;
* mora;

según la lógica actualmente implementada en `InstallmentsService`.

La relación persistente entre pago y cuota se registra en:

```text
PAYMENT_INSTALLMENT_APPLICATIONS
```

---

# 14. Modelo actual de Payment

La entidad actual contiene:

```text
paymentId
societyId
clientId
saleId
staffId
routeSheetItemId
amount
method
paymentDate
notes
createdAt
updatedAt
```

Tabla:

```text
PAYMENTS
```

---

# 15. Modelo actual de Payment Installment Application

Tabla:

```text
PAYMENT_INSTALLMENT_APPLICATIONS
```

Campos:

```text
applicationId
paymentId
installmentId
appliedAmount
createdAt
```

Su función es conservar la relación entre:

```text
Payment
    ↓
Installment
```

y el importe imputado.

---

# 16. Seguridad y sociedad

Todos los endpoints de Payments utilizan:

```text
JwtAuthGuard
RolesGuard
SocietyGuard
```

La sociedad activa se obtiene del JWT.

El endpoint de listado utiliza explícitamente:

```text
user.societyId
```

para limitar los resultados a la sociedad activa.

Los endpoints de creación también utilizan la sociedad del usuario autenticado.

---

# 17. Integración Frontend actual

El frontend dispone de:

```text
canarias-frontend/src/app/(private)/payments/page.tsx
```

para consultar y visualizar pagos.

También dispone de:

```text
canarias-frontend/src/app/(private)/payments/new/page.tsx
```

para registrar nuevos pagos.

El acceso HTTP se centraliza en:

```text
canarias-frontend/src/services/payments/payments.service.ts
```

Funciones actualmente implementadas:

```ts
getPayments()
getPayment(id)
createPayment(payload)
getPaymentApplications(paymentId)
applyPayment(paymentId, payload)
```

---

# 18. Estado actual respecto al recargo por transferencia

Actualmente el API de Payments **todavía no implementa** el recargo opcional del 21%.

El backend actualmente registra solamente:

```text
amount
method
```

Por lo tanto, la futura implementación deberá ampliar el contrato de Payments para diferenciar:

```text
monto base
recargo por transferencia
total recibido
```

El recargo deberá permanecer separado del monto base y no deberá modificar el importe de la cuota.

Esta modificación corresponde a una evolución posterior del API y deberá acompañarse con:

* modificación de DTO;
* modificación de entidad;
* migración de base de datos;
* actualización del servicio;
* actualización de tipos frontend;
* actualización del formulario de registro de pagos;
* integración con Caja.

---

# 19. Fuera de alcance actual

El API actual de Payments no contempla:

* conciliación bancaria;
* reversión de pagos;
* notas de crédito;
* integración directa con plataformas bancarias;
* reportes específicos de recargos por transferencia;
* cálculo de recargo por transferencia del 21%.

La funcionalidad de recargo del 21% queda definida como regla de negocio para su implementación en la siguiente evolución del módulo.

---

# 20. Archivos principales

### Backend

```text
backend/src/modules/payments/payments.module.ts
backend/src/modules/payments/controllers/payments.controller.ts
backend/src/modules/payments/services/payments.service.ts
backend/src/modules/payments/repositories/payments.repository.ts
backend/src/modules/payments/entities/payment.entity.ts
backend/src/modules/payments/entities/payment-installment-application.entity.ts
backend/src/modules/payments/dto/create-payment.dto.ts
backend/src/modules/payments/dto/apply-payment.dto.ts
backend/src/modules/payments/interfaces/payments-repository.interface.ts
backend/src/common/enums/payment-method.enum.ts
```

### Frontend

```text
canarias-frontend/src/app/(private)/payments/page.tsx
canarias-frontend/src/app/(private)/payments/new/page.tsx
canarias-frontend/src/services/payments/payments.service.ts
canarias-frontend/src/types/payments/payment.types.ts
canarias-frontend/src/hooks/payments/
canarias-frontend/src/components/payments/
```

---

# Estado

Documento actualizado Sprint 05.
