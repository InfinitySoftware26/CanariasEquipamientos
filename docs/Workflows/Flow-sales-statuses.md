# Canarias System — Sale Statuses

# Objetivo

Centralizar los estados utilizados por el flujo comercial para garantizar consistencia entre Backend, Frontend y documentación funcional.

---

# Sale Status

Representa el estado general de una venta dentro del proceso comercial.

## Estados

| Estado                      | Descripción                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| PENDING_ADMIN_VALIDATION    | Venta registrada por vendedor y pendiente de validación administrativa |
| REJECTED_ADMIN              | Venta rechazada por administración                                     |
| PENDING_ENVIRONMENTAL_VISIT | Venta aprobada administrativamente y pendiente de visita ambiental     |
| ENVIRONMENTAL_REJECTED      | Venta rechazada durante la visita ambiental                            |
| PENDING_DELIVERY            | Venta aprobada y pendiente de entrega                                  |
| DELIVERED                   | Producto entregado al cliente                                          |
| CLOSED                      | Venta cerrada administrativamente                                      |

---

# Flujo Principal

```text
PENDING_ADMIN_VALIDATION
            │
            ▼
PENDING_ENVIRONMENTAL_VISIT
            │
            ▼
PENDING_DELIVERY
            │
            ▼
DELIVERED
            │
            ▼
CLOSED
```

---

# Rechazo Administrativo

```text
PENDING_ADMIN_VALIDATION
            │
            ▼
REJECTED_ADMIN
```

Estado final.

---

# Rechazo Visita Ambiental

```text
PENDING_ENVIRONMENTAL_VISIT
            │
            ▼
ENVIRONMENTAL_REJECTED
```

Estado final.

---

# Sale Validation Status

Representa el resultado de una validación administrativa.

## Estados

| Estado   | Descripción          |
| -------- | -------------------- |
| PENDING  | Validación pendiente |
| APPROVED | Validación aprobada  |
| REJECTED | Validación rechazada |

---

# Installment Status

Representa el estado de una cuota.

## Estados

| Estado  | Descripción              |
| ------- | ------------------------ |
| PENDING | Cuota pendiente de cobro |
| PAID    | Cuota cobrada            |
| OVERDUE | Cuota vencida            |

---

# Product Status

Representa la disponibilidad lógica de un producto.

## Estados

| Estado   | Descripción                     |
| -------- | ------------------------------- |
| ACTIVE   | Producto disponible para ventas |
| INACTIVE | Producto deshabilitado          |

---

# Zone Status

Representa la disponibilidad de una zona.

## Estados

| Estado   | Descripción        |
| -------- | ------------------ |
| ACTIVE   | Zona habilitada    |
| INACTIVE | Zona deshabilitada |

---

# Staff Society Status

Representa la asignación de un empleado a una sociedad.

## Estados

| Estado   | Descripción              |
| -------- | ------------------------ |
| ACTIVE   | Asignación activa        |
| INACTIVE | Asignación deshabilitada |

---

# Staff Zone Status

Representa la asignación de un empleado a una zona.

## Estados

| Estado   | Descripción              |
| -------- | ------------------------ |
| ACTIVE   | Asignación activa        |
| INACTIVE | Asignación deshabilitada |

---

# Convenciones

Todos los estados deberán:

* almacenarse en formato ENUM en Backend
* utilizar nomenclatura UPPER_SNAKE_CASE
* compartir exactamente los mismos valores entre Backend y Frontend
* utilizarse para filtros, badges, dashboards y reglas de negocio

---

# Estado Actual

Documento vigente para Sprint 02.
