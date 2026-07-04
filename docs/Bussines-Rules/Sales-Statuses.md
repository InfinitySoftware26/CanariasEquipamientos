# Canarias System — Sale Statuses

# Objetivo

Definir los estados utilizados por los módulos involucrados en el proceso comercial del Sprint 02.

Los valores definidos aquí deben mantenerse iguales entre Backend y Frontend.

---

# Sale Status

Representa el ciclo de vida de una venta.

| Estado | Descripción |
|---|---|
| PENDING_ADMIN_VALIDATION | Venta creada esperando validación administrativa |
| REJECTED_ADMIN | Venta rechazada por administración |
| PENDING_ENVIRONMENTAL_VISIT | Venta aprobada administrativamente esperando visita ambiental |
| ENVIRONMENTAL_REJECTED | Venta rechazada durante visita ambiental |
| PENDING_DELIVERY | Venta aprobada pendiente de entrega |
| DELIVERED | Producto entregado al cliente |
| CLOSED | Venta cerrada administrativamente |

---

# Sale Validation Status

Representa el resultado de una validación.

| Estado | Descripción |
|---|---|
| PENDING | Validación pendiente |
| APPROVED | Validación aprobada |
| REJECTED | Validación rechazada |

---

# Installment Status

Representa el estado de una cuota.

| Estado | Descripción |
|---|---|
| PENDING | Cuota pendiente de cobro |
| PAID | Cuota cobrada |
| OVERDUE | Cuota vencida |

---

# Product Status

Representa disponibilidad del producto.

| Estado | Descripción |
|---|---|
| ACTIVE | Producto disponible |
| INACTIVE | Producto deshabilitado |

---

# Zone Status

Representa disponibilidad de una zona.

| Estado | Descripción |
|---|---|
| ACTIVE | Zona habilitada |
| INACTIVE | Zona deshabilitada |

---

# Staff Zone Status

Representa la relación empleado-zona.

| Estado | Descripción |
|---|---|
| ACTIVE | Relación vigente |
| INACTIVE | Relación deshabilitada |

---

# Staff Society Status

Representa la relación empleado-sociedad.

| Estado | Descripción |
|---|---|
| ACTIVE | Relación vigente |
| INACTIVE | Relación deshabilitada |

---

# Convenciones

Todos los estados deben:

- usar formato UPPER_SNAKE_CASE
- almacenarse como ENUM
- compartirse entre Backend y Frontend
- utilizarse en filtros y validaciones

---

# Estado

Documento vigente.

Estados definidos:
✅ Completos

Implementación operativa:
🟡 Parcial

Validado Sprint 02:
Hasta PENDING_ENVIRONMENTAL_VISIT