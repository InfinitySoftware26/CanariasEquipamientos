# Canarias System — Sales Business Rules

# Objetivo

Documentar las reglas de negocio relacionadas al proceso comercial de ventas.

Este documento define los comportamientos, restricciones y validaciones principales del módulo Sales.

---

# Descripción

Una venta representa una solicitud comercial realizada por un vendedor o un administrador para un cliente.

La operación contempla:

- selección de plan/promocion/producto
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
| ADMIN | Registra ventas administrativas, valida información, coordina entregas y realiza el cierre administrativo. |
| COLLECTOR | Aprueba visitas ambientales, realiza la entrega del producto, recibe la documentación requerida y registra el cobro de la primera cuota. |
| MANAGER | Supervisa la operación comercial y administrativa. |

---

# Reglas de Creación

## BR-SALES-001

Toda venta debe estar asociada a un cliente existente.

---

## BR-SALES-002

Toda venta debe registrar al menos un plan, promocion o producto solicitado.

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

El resultado de la visita ambiental a cargo del cobrador de la zona asignado determinará si la operación continúa o finaliza.

Al aprobar la visita, el sistema informa al cobrador que Administración coordinará la entrega y el cobro de la primera cuota, y que la misma aparecerá en la hoja de ruta correspondiente.

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

El checklist de documentación se completa en la entrega, desde la hoja de ruta, y se registra en la validación de paso `DELIVERY`:

- fotocopia del DNI;
- contrato firmado;
- comprobante de servicio del domicilio.

Los tres campos son opcionales: lo que no se tilda queda registrado como no recibido. Ya no se exige el checklist al aprobar la visita ambiental, y se eliminó el registro "entrega de documentación al cobrador" (`PATCH /sales/:id/collector-documents`) por redundante.

En la hoja de ruta, cuando corresponde cobrar la primera cuota en la entrega, debe registrarse su cobro completo. Las cuotas posteriores admiten pagos parciales.

Limitación pendiente: el endpoint directo `PATCH /sales/:id/deliver` no aplica todas las validaciones del flujo de entrega desde la hoja de ruta.

---

## BR-SALES-015

Una vez coordinada la entrega, Administración podrá recoordinarla (cambiar la fecha) mientras la venta continúe pendiente de entrega.

- Se reutiliza la misma operación de coordinación (`PATCH /sales/:id/schedule-delivery`); no existe una operación separada.
- En la pantalla de la venta, el botón "Guardar coordinación" pasa a "Recoordinar entrega" una vez guardada la fecha.
- Al guardar se muestra una única alerta "Entrega coordinada" que confirma la fecha y permite cambiarla. Volver a guardar la misma fecha no genera error ni duplica la entrega.
- La fecha solo se modifica en el paso de coordinación; el paso de cierre administrativo ya no tiene botón "Actualizar fecha".
- Al regenerar la hoja de la nueva fecha coordinada, el ítem de entrega pendiente de la fecha anterior se elimina y se genera uno nuevo. Si la fecha no cambió, no se duplica en el flujo secuencial.
- La hoja de la fecha anterior puede quedar sin ítems.

---

# Cierre

## BR-SALES-016

La documentación pendiente (DNI o comprobantes de servicio) podrá completarse posteriormente cuando la operación así lo permita.

---

## BR-SALES-017

La venta únicamente podrá pasar al estado CLOSED cuando:

- el producto haya sido entregado;
- el contrato haya sido firmado;
- el primer pago haya sido registrado;
- la administración confirme la recepción de la documentación y el cierre de la operación.

---

## BR-SALES-018

El cierre definitivo de una venta será responsabilidad exclusiva del área Administrativa.

---

## BR-SALES-019

La comisión del vendedor será acreditada únicamente cuando la venta alcance el estado CLOSED.

---

## BR-SALES-020

La creación de una venta podrá generar el alta inicial de un nuevo cliente.

El cliente creado quedará asociado a la venta.

---

## BR-SALES-022

El detalle de la venta identifica la venta con su código visible (`VTA-XXXXXXXX`, el mismo de la lista de ventas) en lugar del ID interno.

- Muestra el nombre del plan o promoción aplicada (dentro de Financiación) y la zona del cliente (dentro de Cliente).
- En "Estado operativo", el bloque de cobro inicial se rotula "Entrega + Primera Cuota".
---

# Condiciones efectivas

Las condiciones finales de la venta deben determinar:

porcentaje de ganancia;
cantidad de cuotas;
frecuencia de pago;
financiación utilizada;
plan utilizado, cuando corresponda;
promoción utilizada, cuando corresponda.

Cuando una promoción está basada en un plan, se usan la cantidad y frecuencia del plan y se aplica el ajuste de la promoción a su tasa. La tasa directa del plan tiene prioridad sobre la tasa de su configuración. Para una promoción independiente se utilizan sus propias condiciones cuando están definidas. La tasa resultante tiene un mínimo de -0.99.

Cuando la venta no usa plan ni promoción, el vendedor puede indicar una tasa de financiación personalizada no negativa (`financingRate`; 0.12 = 12%, 5 = 500%). Si elige una configuración de financiación existente, el sistema toma la tasa de esa configuración. Las tasas e importes siguen sujetos a la precisión de las columnas de base de datos.

---

# Financiación de la venta

Una venta financiada debe utilizar una de las alternativas de financiación disponibles:

Plan de financiación.

Promoción.

La venta no debe seleccionar simultáneamente un plan y una promoción.

Si se recibe una promoción asociada a un plan, el backend resuelve las condiciones desde el plan asociado a esa promoción.

---

# Retiro por falta de pago

El retiro del producto puede producirse como consecuencia de incumplimiento de pago.

La condición definida por la empresa es:

Dos cuotas consecutivas impagas.

Cuando se cumple esta condición:

El sistema debe identificar el incumplimiento.
Debe generar una notificación interna dirigida a Administración.
Administración puede gestionar el retiro del producto.
Una vez registrado el retiro, debe actualizarse la información correspondiente a la deuda y a la plata en calle según las reglas de Caja.

El retiro no debe borrar el historial de la venta ni los pagos realizados previamente.

---

# Auditoría

El sistema deberá registrar:

- vendedor creador;
- administrador interviniente;
- cobrador asignado;
- fecha de coordinación de entrega;
- fecha de entrega;
- observaciones.

---

# Estado

Documento vigente Sprint 05.