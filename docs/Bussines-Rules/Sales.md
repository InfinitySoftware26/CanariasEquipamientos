# Canarias System — Sales Business Rules

# Objetivo

Documentar las reglas de negocio relacionadas al proceso comercial de ventas.

Este documento define comportamientos, restricciones y validaciones principales del módulo Sales.

---

# Descripción

Una venta representa una solicitud comercial realizada por un vendedor para un cliente.

La operación contempla:

- selección de producto
- validación administrativa
- visita ambiental
- entrega
- cierre administrativo
- generación de cuotas

---

# Actores Involucrados

| Rol | Responsabilidad |
| SELLER | Registra la solicitud de venta |
| ADMIN | Valida información y cierra la operación |
| COLLECTOR | Ejecuta visitas y entregas |
| MANAGER | Supervisión |

---

# Reglas de Creación

## BR-SALES-001

Toda venta debe estar asociada a un cliente existente.

---

## BR-SALES-002

Toda venta debe registrar al menos un producto solicitado.

---

## BR-SALES-003

La venta debe estar asociada a una sociedad válida.

---

## BR-SALES-004

La venta debe tener una zona asignada para su gestión operativa.

---

# Validación Administrativa

## BR-SALES-005

Toda venta nueva inicia en estado:

PENDING_ADMIN_VALIDATION

---

## BR-SALES-006

La administración debe validar la información enviada por el vendedor antes de continuar el proceso.

---

## BR-SALES-007

Una venta rechazada administrativamente no puede continuar el flujo operativo.

---

# Visita Ambiental

## BR-SALES-008

Una venta aprobada administrativamente requiere una evaluación ambiental.

---

## BR-SALES-009

El resultado de la visita ambiental determina si la operación continúa o finaliza.

---

# Entrega

## BR-SALES-010

Una venta aprobada ambientalmente puede pasar a planificación de entrega.

---

## BR-SALES-011

La entrega debe ser registrada por el cobrador asignado.

---

# Cierre

## BR-SALES-012

La venta puede cerrarse únicamente cuando:

- el producto fue entregado
- el contrato fue firmado

---

## BR-SALES-013

La documentación pendiente (DNI o servicio) puede completarse posteriormente.

---

# Cuotas

## BR-SALES-014

La generación de cuotas ocurre cuando la venta es cerrada.

---

## BR-SALES-015

Las cuotas generadas quedan asociadas a la venta original.

---

## BR-SALES-016

La creación de una venta puede generar el alta inicial de un nuevo cliente.

El cliente creado queda asociado a la venta.

---

# Auditoría

El sistema debe registrar:

- vendedor creador
- administrador validador
- cobrador interviniente
- fechas
- cambios de estado
- observaciones

---

# Estado

Documento vigente Sprint 02.