# Canarias System — Sales API

# Objetivo

Documentar el módulo de ventas del sistema.

El módulo será responsable de:

* creación ventas
* asociación cliente
* cálculo financiación
* aprobación administrativa
* generación cuotas
* preparación entregas

---

# Endpoint Base

```http
/api/v1/sales
```

---

# Roles Permitidos

| Rol       | Acceso          |
| --------- | --------------- |
| ADMIN     | Completo        |
| SELLER    | Crear ventas    |
| MANAGER   | Lectura         |
| COLLECTOR | Lectura parcial |

---

# Estados Venta

| Estado             | Descripción          |
| ------------------ | -------------------- |
| PENDING_VALIDATION | Esperando validación |
| APPROVED           | Venta aprobada       |
| REJECTED           | Venta rechazada      |
| READY_FOR_DELIVERY | Lista entrega        |
| DELIVERED          | Producto entregado   |
| CANCELLED          | Venta cancelada      |

---

# Endpoints

---

# Crear Venta

## Endpoint

```http
POST /sales
```

---

# Descripción

Permite registrar nueva venta financiada.

---

# Roles

* SELLER
* ADMIN

---

# Request

```json
{
  "clientId": "uuid",
  "productId": "uuid",
  "sellerId": "uuid",
  "societyId": "uuid",
  "deliveryAddress": "San Martín 123",
  "observations": "Entrega lunes"
}
```

---

# Reglas Operativas

* una venta corresponde a un cliente
* una venta corresponde inicialmente a un producto
* la financiación se resuelve automáticamente
* la venta requiere validación administrativa

---

# Resolución Financiera

La venta financiada resuelve tasa y cuotas combinando 3 entidades del módulo
`financing` (ver `docs/Api/Financing.md`):

1. **FinancingPlan** seleccionado (define cantidad de cuotas y frecuencia).
2. **FinancingConfiguration** vinculada al plan (define la tasa base).
3. **Promotion** opcional (aplica descuento o recargo con signo sobre la tasa base).

> Pendiente (Fase 2): `SalesService.createSale()` aún usa una tasa fija temporal
> (12%) en lugar de resolver estas 3 entidades. Ver `Bussines-Rules/Financings.md`.

---

# Resultado Operativo

Al crear venta:

* se genera venta pendiente
* se genera validación
* NO se generan cuotas todavía
* NO se asigna entrega todavía

---

# Response Success

```json
{
  "success": true,
  "message": "Sale created successfully",
  "data": {
    "id": "uuid",
    "status": "PENDING_VALIDATION"
  }
}
```

---

# Aprobar Venta

## Endpoint

```http
POST /sales/:id/approve
```

---

# Roles

* ADMIN

---

# Objetivo

Aprobar venta luego visita ambiental.

---

# Resultado Operativo

Al aprobar:

* venta cambia a APPROVED
* se generan cuotas
* se habilita entrega
* aparece en hoja de ruta

---

# Request

```json
{
  "approved": true,
  "observations": "Cliente aprobado"
}
```

---

# Rechazar Venta

## Endpoint

```http
POST /sales/:id/reject
```

---

# Resultado

* venta pasa a REJECTED
* se bloquea proceso operativo

---

# Obtener Venta

## Endpoint

```http
GET /sales/:id
```

---

# Información Incluida

* cliente
* producto
* cuotas
* financiación
* vendedor
* estado
* historial validación

---

# Buscar Ventas

## Endpoint

```http
GET /sales
```

---

# Query Params

| Parámetro | Tipo   |
| --------- | ------ |
| page      | number |
| limit     | number |
| status    | string |
| sellerId  | uuid   |
| societyId | uuid   |
| clientId  | uuid   |

---

# Response

```json
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

# Cuotas

Las cuotas deberán generarse automáticamente al aprobar venta.

---

# Entregas

Las ventas aprobadas podrán:

* asignarse hoja ruta
* asignarse cobrador
* marcarse entregadas

---

# Reglas Negocio

* ventas rechazadas no generan cuotas
* ventas canceladas mantienen auditoría
* toda venta requiere cliente válido
* toda venta requiere validación administrativa

---

# Auditoría

Registrar:

* creador venta
* aprobador
* timestamps
* cambios estado

---

# Seguridad

* JWT obligatorio
* permisos por rol
* filtrado por sociedad

---

# Escalabilidad Futura

Preparado para:

* múltiples productos por venta
* firma digital
* scoring automático
* promociones
* aprobación automática IA

---

# Estado Actual

Módulo aprobado para Fase 1.
