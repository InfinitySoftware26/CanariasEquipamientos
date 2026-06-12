# Canarias System — Sale State Transitions

# Objetivo

Definir las transiciones permitidas dentro del ciclo de vida de una venta.

Este documento establece qué estados puede tener una venta, quién puede modificarlos y bajo qué condiciones.

---

# Sale Lifecycle

Flujo principal:

PENDING_ADMIN_VALIDATION

↓

PENDING_ENVIRONMENTAL_VISIT

↓

PENDING_DELIVERY

↓

DELIVERED

↓

CLOSED

---

# Transiciones Permitidas

| Estado Actual | Acción | Rol Responsable | Nuevo Estado |
|---|---|---|---|
| PENDING_ADMIN_VALIDATION | Aprobar validación administrativa | ADMIN | PENDING_ENVIRONMENTAL_VISIT |
| PENDING_ADMIN_VALIDATION | Rechazar venta | ADMIN | REJECTED_ADMIN |
| PENDING_ENVIRONMENTAL_VISIT | Aprobar visita ambiental | COLLECTOR | PENDING_DELIVERY |
| PENDING_ENVIRONMENTAL_VISIT | Rechazar visita ambiental | COLLECTOR | ENVIRONMENTAL_REJECTED |
| PENDING_DELIVERY | Confirmar entrega | COLLECTOR | DELIVERED |
| DELIVERED | Cerrar venta | ADMIN | CLOSED |

---

# Estados Finales

Los siguientes estados no permiten continuar el flujo:

- REJECTED_ADMIN
- ENVIRONMENTAL_REJECTED
- CLOSED

---

# Permisos por Rol

## SELLER

Puede:

- crear solicitudes de venta
- ingresar información inicial del cliente
- cargar productos solicitados

No puede:

- aprobar ventas
- rechazar ventas
- cerrar ventas


---

## ADMIN

Puede:

- validar información
- aprobar solicitudes
- rechazar operaciones
- cerrar ventas


---

## COLLECTOR

Puede:

- registrar visita ambiental
- registrar resultado de visita
- confirmar entrega


---

# Restricciones

- Una venta cerrada no puede volver a un estado anterior.
- Una venta rechazada no puede continuar el proceso.
- Backend debe validar siempre la transición solicitada.
- Frontend solo debe mostrar acciones permitidas según rol y estado.

---

# Estado

Documento vigente Sprint 02.