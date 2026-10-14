# Canarias System — Cashbox API

# Objetivo

Documentar el módulo de cajas del sistema.

El módulo es responsable de:

* apertura de cajas
* cierre de cajas
* consulta de cajas
* consulta de caja abierta
* consulta de saldo calculado
* control básico de continuidad financiera

---

# Módulo Backend

```text
backend/src/modules/cashbox/
```

El módulo utiliza:

* `CashboxController`
* `CashboxService`
* `CashboxRepository`
* `Cashbox` entity

La gestión de movimientos financieros se encuentra separada en:

```text
backend/src/modules/cash-movements/
```

---

# Endpoint Base

```http
/api/v1/cashbox
```

---

# Roles Permitidos

| Rol         | Acceso |
| ----------- | ------ |
| ADMIN       | Sí     |
| MANAGER     | Sí     |
| SUPER_ADMIN | Sí     |
| SELLER      | No     |
| COLLECTOR   | No     |

Todos los endpoints requieren:

* JWT
* RolesGuard
* SocietyGuard

El `societyId` se obtiene del usuario autenticado.

No se recibe `societyId` en el body para abrir una caja.

---

# Estados de Caja

| Estado | Descripción  |
| ------ | ------------ |
| OPEN   | Caja abierta |
| CLOSED | Caja cerrada |

---

# Endpoints

---

# Listar Cajas

## Endpoint

```http
GET /cashbox
```

---

# Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Objetivo

Obtener las cajas registradas para la sociedad activa.

---

# Response

Devuelve el listado de cajas de la sociedad ordenado por fecha de apertura descendente.

La respuesta incluye la información almacenada en la entidad `Cashbox`.

---

# Obtener Caja Abierta

## Endpoint

```http
GET /cashbox/open
```

---

# Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Objetivo

Obtener la caja actualmente abierta para la sociedad.

---

# Resultado

Si existe una caja abierta:

```text
Cashbox
```

Si no existe:

```http
404 Not Found
```

---

# Obtener Caja

## Endpoint

```http
GET /cashbox/:id
```

---

# Objetivo

Obtener el detalle de una caja específica.

---

# Parámetros

| Parámetro | Tipo |
| --------- | ---- |
| id        | UUID |

---

# Response

Devuelve la información de la caja:

* cashboxId
* societyId
* staffId
* openingDate
* openingBalance
* closingBalance
* status
* closedAt
* notes
* createdAt
* updatedAt

---

# Obtener Saldo

## Endpoint

```http
GET /cashbox/:id/balance
```

---

# Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Objetivo

Obtener el saldo calculado por el sistema para una caja.

---

# Response

```json
{
  "openingBalance": 20000,
  "systemBalance": 85000,
  "declaredClosingBalance": 85000
}
```

---

# Cálculo

Actualmente el backend calcula:

```text
openingBalance
+
INCOME
-
EXPENSE
-
TRANSFER
```

Las transferencias actualmente se consideran como una salida de la caja consultada.

La implementación de transferencias entre cuentas con origen y destino queda pendiente de adaptación.

---

# Abrir Caja

## Endpoint

```http
POST /cashbox
```

---

# Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Objetivo

Abrir una nueva caja para la sociedad.

No puede existir otra caja abierta para la misma sociedad.

---

# Request

```json
{
  "openingBalance": 20000,
  "notes": "Saldo inicial"
}
```

---

# Validaciones

| Campo          | Regla                      |
| -------------- | -------------------------- |
| openingBalance | requerido, número positivo |
| notes          | opcional                   |

---

# Resultado Operativo

Al abrir una caja:

* se asocia a la sociedad del usuario;
* se registra el usuario responsable;
* se registra la fecha de apertura;
* se establece el saldo inicial;
* el estado pasa a `OPEN`.

---

# Restricción

Si la sociedad ya posee una caja abierta:

```http
409 Conflict
```

---

# Cerrar Caja

## Endpoint

```http
PATCH /cashbox/:id/close
```

---

# Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Objetivo

Cerrar la caja correspondiente al período operativo.

---

# Request

```json
{
  "closingBalance": 85000,
  "notes": "Cierre diario"
}
```

---

# Validaciones

| Campo          | Regla                      |
| -------------- | -------------------------- |
| closingBalance | requerido, número positivo |
| notes          | opcional                   |

---

# Resultado Operativo

Al cerrar la caja:

* el estado pasa a `CLOSED`;
* se registra la fecha de cierre;
* se registra el saldo declarado.

La operación no elimina movimientos ni reinicia el saldo.

---

# Continuidad de Saldo

El cierre de una caja no significa retirar físicamente el dinero.

Ejemplo:

```text
Día 1
Saldo final: $60.000

Día 2
Saldo inicial: $60.000
```

La continuidad del saldo no representa una transferencia.

---

# Relación con Movimientos

Los movimientos financieros se registran mediante:

```http
/api/v1/cash-movements
```

La caja utiliza dichos movimientos para calcular el saldo del sistema.

---

# Relación con Rendiciones

El sistema posee además el módulo:

```http
/api/v1/settlements
```

Actualmente permite:

* listar liquidaciones;
* consultar una liquidación;
* generar una liquidación a partir de un cierre validado;
* validar o rechazar una liquidación.

La integración automática entre una liquidación validada y el movimiento financiero de la caja queda pendiente de implementación.

---

# Seguridad

* JWT obligatorio.
* Roles mediante `RolesGuard`.
* Sociedad mediante `SocietyGuard`.
* El `societyId` se obtiene del usuario autenticado.

---

# Consideraciones Actuales

La implementación actual utiliza una entidad `Cashbox` como contenedor financiero.

El modelo definido para la evolución del sistema contempla cuentas financieras configurables, por ejemplo:

* caja;
* cuenta bancaria;
* Mercado Pago;
* Fondo de Gestión.

La migración hacia este modelo deberá realizarse sin romper las rutas actuales.

---

# Evolución Prevista

La API deberá evolucionar para soportar:

* cuentas financieras configurables;
* transferencias con cuenta origen y destino;
* Fondo de Gestión;
* permisos específicos sobre información financiera restringida;
* relación directa entre rendiciones validadas y movimientos financieros.

Las rutas existentes deberán conservarse cuando sea posible para evitar romper integraciones existentes.

---

# Estado Actual

Módulo existente.

Implementado:

* apertura;
* cierre;
* consulta;
* consulta de caja abierta;
* cálculo de saldo;
* control de una caja abierta por sociedad.

Pendiente:

* cuentas financieras configurables;
* transferencias con origen/destino;
* Fondo de Gestión;
* integración automática Settlement → Cash Movement.

Documento actualizado Sprint 05.
