# Canarias System — Installments Business Rules

# Objetivo

Documentar las reglas de negocio relacionadas con la generación, administración y seguimiento de las cuotas asociadas a una venta.

Este documento define el comportamiento esperado del módulo Installments, responsable de representar la deuda generada por una venta financiada.

---

# Descripción

Una cuota representa una obligación de pago asociada a una venta aprobada.

El módulo Installments administra el plan de financiación de cada venta y constituye la fuente oficial de información para los procesos de cobranza.

Las cuotas representan deuda pendiente.

No representan pagos realizados.

---

# Creación de Cuotas

## BR-INSTALLMENT-001

Las cuotas no se generan al momento de crear una venta.

---

## BR-INSTALLMENT-002

La generación automática del plan de cuotas ocurre cuando la Administración coordina la entrega de una venta aprobada ambientalmente.

En ese momento el sistema genera automáticamente todas las cuotas correspondientes a la venta, permitiendo que la primera cuota pueda ser cobrada durante el proceso de entrega.

Flujo:

Venta creada

↓

Validación administrativa

↓

Visita ambiental

↓

Aprobación administrativa

↓

Coordinación de entrega

↓

Generación automática del plan de cuotas

↓

Entrega del producto

↓

Cobro de la primera cuota

↓

Cierre administrativo

---

## BR-INSTALLMENT-003

La generación del plan de cuotas deberá ejecutarse una única vez por venta.

Una venta no podrá generar múltiples planes de cuotas.

---

# Relación con Venta

## BR-INSTALLMENT-004

Toda cuota pertenece obligatoriamente a una única venta.

Una venta podrá poseer múltiples cuotas.

La cantidad dependerá de la configuración financiera utilizada.

---

# Estados

## BR-INSTALLMENT-005

Cada cuota deberá mantener un estado operativo.

Estados soportados:

- PENDING
- PARTIAL
- PAID
- OVERDUE
- CANCELLED

---

## BR-INSTALLMENT-006

El estado de una cuota únicamente podrá modificarse mediante procesos autorizados del sistema.

No se permitirá modificar manualmente una cuota desde la base de datos o mediante procesos externos.

---

# Cobranza

## BR-INSTALLMENT-007

Las cuotas serán utilizadas como fuente oficial para los procesos de cobranza.

El sistema deberá permitir consultar:

- cuotas pendientes;
- cuotas parcialmente abonadas;
- cuotas vencidas;
- cuotas canceladas;
- historial de pagos asociados.

---

## BR-INSTALLMENT-008

Una cuota podrá recibir uno o varios pagos hasta completar su importe.

Su estado será actualizado automáticamente según el saldo pendiente.

---

# Restricciones

## BR-INSTALLMENT-009

No podrán existir cuotas asociadas a ventas rechazadas.

---

## BR-INSTALLMENT-010

Una cuota no podrá eliminarse una vez generada.

En caso de cancelación de la venta deberán utilizarse los procesos definidos por el negocio.

---

# Auditoría

El sistema deberá registrar:

- venta origen;
- cliente asociado;
- fecha de generación;
- usuario o proceso generador;
- estado;
- cambios realizados.

---

# Alcance Actual

Sprint 03

Incluye:

- generación automática del plan de cuotas;
- relación venta-cuota;
- estados básicos;
- actualización automática del estado luego de cada pago;
- integración con el módulo Payments;
- preparación para futuras cobranzas.

Fuera de alcance:

- intereses;
- refinanciaciones;
- planes especiales;
- recálculo de cuotas;
- punitorios;
- descuentos financieros.

---

# Estado

Documento vigente Sprint 03.