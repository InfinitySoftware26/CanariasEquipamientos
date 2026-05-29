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

# Endpoint Base

```http id="g9k4u3"
/api/v1/collections
```

---

# Roles Permitidos

| Rol       | Acceso          |
| --------- | --------------- |
| ADMIN     | Completo        |
| COLLECTOR | Operativo       |
| MANAGER   | Lectura         |
| SELLER    | Lectura parcial |

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

# Obtener Cuotas

## Endpoint

```http id="jv9t7u"
GET /collections/installments
```

---

# Query Params

| Parámetro   | Tipo   |
| ----------- | ------ |
| page        | number |
| limit       | number |
| status      | string |
| collectorId | uuid   |
| clientId    | uuid   |
| societyId   | uuid   |
| dueDate     | date   |

---

# Response

```json id="v1y1xj"
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

# Obtener Cuota

## Endpoint

```http id="y9m0bw"
GET /collections/installments/:id
```

---

# Información Incluida

* cliente
* venta
* cobrador
* monto
* vencimiento
* historial pagos
* estado

---

# Registrar Cobro

## Endpoint

```http id="jhz3j6"
POST /collections/payments
```

---

# Roles

* COLLECTOR
* ADMIN

---

# Objetivo

Registrar pago realizado por cliente.

---

# Request

```json id="0w5rbq"
{
  "clientId": "uuid",
  "installmentIds": [],
  "amount": 15000,
  "paymentMethod": "CASH",
  "observations": "Pago parcial"
}
```

---

# Resultado Operativo

Al registrar pago:

* cuotas actualizan estado
* se genera recibo
* impacta caja
* impacta cierre diario cobrador

---

# Estados Pago

| Estado    | Descripción     |
| --------- | --------------- |
| COMPLETED | Pago registrado |
| PARTIAL   | Pago parcial    |
| CANCELLED | Pago anulado    |

---

# Pago Parcial

El sistema deberá permitir:

* pagos incompletos
* distribución saldo
* actualización deuda restante

---

# Generar Recibo

## Endpoint

```http id="66r6kp"
POST /collections/payments/:id/receipt
```

---

# Resultado

Genera comprobante asociado al pago.

---

# Obtener Historial Cliente

## Endpoint

```http id="hbd4gk"
GET /collections/clients/:id/history
```

---

# Información Incluida

* cuotas
* pagos
* atrasos
* deuda total
* mora
* recibos

---

# Cuotas Vencidas

## Endpoint

```http id="2zcjlwm"
GET /collections/overdue
```

---

# Objetivo

Listar cuotas vencidas para gestión cobranzas.

---

# Reglas Negocio

---

# Impacto Caja

Todo pago aprobado deberá generar:

```text id="xjlwm7"
cash_movement
```

---

# Auditoría

Registrar:

* cobrador
* fecha
* ubicación futura
* método pago
* modificaciones

---

# Eliminación

Los pagos NO deberán eliminarse físicamente.

Implementar:

```text id="zjlwm0"
soft delete
```

---

# Seguridad

* JWT obligatorio
* permisos por rol
* filtrado sociedad

---

# Paginación

Todos los listados deberán soportar:

* paginación
* filtros
* ordenamiento

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

# Estado Actual

Módulo aprobado para Fase 1.
