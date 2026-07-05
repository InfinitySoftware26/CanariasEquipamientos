# Canarias System — Sale State Transitions

# Objetivo

Definir las transiciones permitidas dentro del ciclo de vida de una venta.

Este documento establece:
- estados posibles;
- transiciones válidas;
- responsables por etapa;
- restricciones operativas;
- validaciones obligatorias.

Este documento describe el comportamiento esperado del flujo comercial independientemente del nivel actual de implementación.

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
| DELIVERED | Confirmar cierre administrativo | ADMIN | CLOSED |

---

# Estados Finales

Los siguientes estados finalizan el flujo y no permiten continuar la operación:

- REJECTED_ADMIN
- ENVIRONMENTAL_REJECTED
- CLOSED

---

# Permisos por Rol

## SELLER

Puede:

- crear preventa / venta inicial;
- ingresar información inicial del cliente;
- seleccionar productos disponibles;
- iniciar operación comercial.

No puede:

- aprobar ventas;
- rechazar ventas;
- coordinar entrega;
- cerrar operaciones.

---

## ADMIN

Puede:

- validar condiciones comerciales;
- aprobar solicitudes;
- rechazar operaciones;
- coordinar entrega;
- confirmar cierre administrativo.

No puede:

- realizar visita ambiental.

---

## COLLECTOR

Puede:

- realizar visita ambiental;
- registrar resultado de visita;
- confirmar entrega;
- solicitar documentación.

No puede:

- aprobar venta;
- cerrar operación.

---

# Restricciones

## Restricciones de estado

- Una venta cerrada no puede volver a estados anteriores.
- Una venta rechazada no puede continuar el flujo.
- Toda transición debe respetar el orden definido.

---

## Restricciones técnicas

- Backend debe validar siempre la transición solicitada.
- Frontend solo debe mostrar acciones permitidas según rol y estado.
- El usuario solo podrá visualizar acciones correspondientes a su contexto operativo.

---

# Alcance actual

El ciclo de vida completo se encuentra definido funcionalmente.

Durante Sprint 02 se validó operativamente únicamente hasta:

PENDING_ENVIRONMENTAL_VISIT

La demostración realizada utilizó información precargada mediante seeds.

Las etapas posteriores continúan pendientes de implementación mediante formularios y operación completa.

---

# Estado

Documento vigente.

Ciclo comercial definido:
✅ Completo

Implementación operativa:
🟡 Parcial

Validado durante Sprint 02:
✅ Hasta PENDING_ENVIRONMENTAL_VISIT