# Canarias System — Sales Events

# Objetivo

Definir los eventos funcionales que ocurren durante el ciclo de vida de una venta.

Los eventos representan acciones relevantes del negocio que producen cambios de estado, generan procesos automáticos o registran información para auditoría.

Este documento complementa:

- Commercial Flow
- Sales Business Rules
- Sale State Transitions

---

# Descripción

Un evento representa una acción ejecutada por un usuario o por el propio sistema que modifica el estado de una venta o inicia un nuevo proceso operativo.

Los eventos permiten mantener una trazabilidad clara del proceso comercial y facilitan futuras integraciones con notificaciones, auditoría y automatizaciones.

---

# Eventos del Proceso Comercial

| Evento | Responsable | Descripción |
|---|---|---|
| SaleCreated | SELLER / ADMIN | Se registra una nueva venta en el sistema. |
| AdminValidationApproved | ADMIN | La Administración aprueba la validación comercial de la venta. |
| AdminValidationRejected | ADMIN | La Administración rechaza la venta durante la validación administrativa. |
| EnvironmentalVisitApproved | COLLECTOR | El cobrador aprueba la visita ambiental realizada al cliente. |
| EnvironmentalVisitRejected | COLLECTOR | El cobrador rechaza la visita ambiental. |
| DeliveryScheduled | ADMIN | La Administración coordina la fecha de entrega del producto. |
| InstallmentsGenerated | SYSTEM | El sistema genera automáticamente el plan completo de cuotas al coordinar la entrega. |
| DeliveryConfirmed | COLLECTOR | El cobrador registra la entrega del producto al cliente. |
| ContractSigned | COLLECTOR | Se registra la firma del contrato por parte del cliente. |
| DocumentationReceived | COLLECTOR | Se registra la recepción de la documentación requerida para la venta. |
| FirstInstallmentCollected | COLLECTOR | El cobrador registra el cobro de la primera cuota durante la entrega. |
| AdministrativeClosure | ADMIN | La Administración verifica la documentación, confirma el primer pago y realiza el cierre administrativo de la venta. |
| SaleClosed | SYSTEM | El sistema cambia el estado de la venta a CLOSED una vez cumplidas todas las condiciones de cierre. |

---

# Eventos Automáticos

Los siguientes eventos son ejecutados automáticamente por el sistema:

## InstallmentsGenerated

Disparador:

- La Administración coordina la entrega de una venta aprobada ambientalmente.

Acción realizada:

- Generar automáticamente el plan completo de cuotas.
- Asociar las cuotas a la venta correspondiente.
- Dejar disponible la primera cuota para su cobro durante la entrega.

---

## SaleClosed

Disparador:

- La Administración confirma que:
  - el producto fue entregado;
  - el contrato fue firmado;
  - la documentación fue recibida;
  - la primera cuota fue registrada.

Acción realizada:

- Cambiar el estado de la venta a CLOSED.
- Habilitar la acreditación de la comisión del vendedor.
- Finalizar el flujo comercial.

---

# Auditoría

Cada evento deberá registrar, como mínimo:

- identificador de la venta;
- usuario responsable (cuando corresponda);
- rol del usuario;
- fecha y hora del evento;
- observaciones registradas;
- estado anterior;
- estado resultante.

Los eventos ejecutados automáticamente deberán identificar al sistema como responsable de la operación.

---

# Estado

Documento vigente.

Eventos funcionales:
✅ Definidos

Automatizaciones:
🟡 Parcialmente implementadas

Alcance actual:
Generación automática del plan de cuotas y cierre administrativo definidos para Sprint 03.