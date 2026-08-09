# Canarias System — Sales Business Rules

# Objetivo

Documentar las reglas de negocio relacionadas al proceso comercial de ventas.

Este documento define los comportamientos, restricciones y validaciones principales del módulo Sales.

---

# Descripción

Una venta representa una solicitud comercial realizada por un vendedor o un administrador para un cliente.

La operación contempla:

- selección de producto
- validación administrativa
- visita ambiental
- coordinación de entrega
- generación automática del plan de cuotas
- entrega del producto y cobro inicial
- cierre administrativo

---

# Actores Involucrados

| Rol | Responsabilidad |
|------|-----------------|
| SELLER | Registra solicitudes de venta. |
| ADMIN | Registra ventas administrativas, valida información, aprueba visitas ambientales, coordina entregas y realiza el cierre administrativo. |
| COLLECTOR | Ejecuta visitas ambientales, realiza la entrega del producto, recibe la documentación requerida y registra el cobro de la primera cuota. |
| MANAGER | Supervisa la operación comercial y administrativa. |

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

## BR-SALES-005

La venta podrá ser registrada por un SELLER o por un ADMIN.

Las ventas creadas por un ADMIN seguirán el mismo flujo operativo que una venta registrada por un SELLER.

---

# Validación Administrativa

## BR-SALES-006

Toda venta nueva inicia en estado:

PENDING_ADMIN_VALIDATION

---

## BR-SALES-007

La administración deberá validar la información enviada y contactarse con el cliente para confirmar los datos personales, explicar las políticas de financiación y verificar que la operación pueda continuar.

---

## BR-SALES-008

Una venta rechazada administrativamente no podrá continuar el flujo operativo.

---

# Visita Ambiental

## BR-SALES-009

Toda venta aprobada administrativamente requiere una evaluación ambiental.

---

## BR-SALES-010

El resultado de la visita ambiental determinará si la operación continúa o finaliza.

---

# Entrega

## BR-SALES-011

Una venta aprobada ambientalmente podrá pasar a la etapa de coordinación de entrega.

---

## BR-SALES-012

Al coordinar la entrega, el sistema deberá generar automáticamente el plan completo de cuotas correspondiente a la venta.

---

## BR-SALES-013

Las cuotas generadas deberán encontrarse disponibles para su consulta y cobro antes de la entrega del producto.

---

## BR-SALES-014

La entrega deberá ser registrada por el cobrador asignado.

Durante la entrega deberá:

- entregar el producto;
- obtener la firma del contrato;
- recibir la documentación requerida;
- cobrar la primera cuota;
- registrar el resultado de la entrega.

---

# Cierre

## BR-SALES-015

La documentación pendiente (DNI o comprobantes de servicio) podrá completarse posteriormente cuando la operación así lo permita.

---

## BR-SALES-016

La venta únicamente podrá pasar al estado CLOSED cuando:

- el producto haya sido entregado;
- el contrato haya sido firmado;
- el primer pago haya sido registrado;
- la administración confirme la recepción de la documentación y el cierre de la operación.

---

## BR-SALES-017

El cierre definitivo de una venta será responsabilidad exclusiva del área Administrativa.

---

## BR-SALES-018

La comisión del vendedor será acreditada únicamente cuando la venta alcance el estado CLOSED.

---

# Cuotas

## BR-SALES-019

Las cuotas generadas quedarán asociadas a la venta que les dio origen.

---

## BR-SALES-020

La creación de una venta podrá generar el alta inicial de un nuevo cliente.

El cliente creado quedará asociado a la venta.

---

## BR-SALES-021

Toda venta deberá permitir configurar la modalidad de pago.

Modalidades permitidas:

- diaria;
- semanal;
- quincenal;
- mensual.

---

## BR-SALES-022

El detalle de la venta deberá mostrar:

- nombre del cliente;
- DNI;
- teléfono;
- dirección;
- referencia telefónica.

---

# Auditoría

El sistema deberá registrar:

- vendedor creador;
- administrador interviniente;
- cobrador asignado;
- fecha de validación administrativa;
- fecha de aprobación ambiental;
- fecha de coordinación de entrega;
- fecha de generación del plan de cuotas;
- fecha de entrega;
- cambios de estado;
- observaciones.

---

# Estado

Documento vigente Sprint 03.