# Canarias System — Payments Business Rules

# Objetivo

Documentar las reglas de negocio relacionadas con el registro de pagos efectuados por los clientes.

Este documento define el comportamiento esperado del módulo Payments, responsable de registrar todos los movimientos de dinero del sistema.

---

# Descripción

Un pago representa un movimiento económico realizado por un cliente para cancelar total o parcialmente una obligación pendiente.

Todo pago deberá quedar registrado independientemente de la cuota a la que sea imputado.

Los pagos representan dinero recibido.

No representan deuda.

---

# Registro de Pagos

## BR-PAYMENT-001

Todo pago deberá estar asociado a un cliente.

---

## BR-PAYMENT-002

Todo pago deberá registrar:

- monto;
- fecha;
- forma de pago;
- empleado que recibió el dinero.

---

## BR-PAYMENT-003

Un pago podrá originarse desde:

- la entrega inicial del producto;
- una cobranza domiciliaria;
- futuros procesos autorizados por el sistema.

---

## BR-PAYMENT-004

Todo pago deberá quedar registrado antes de ser imputado a una o varias cuotas.

---

# Relación con Cuotas

## BR-PAYMENT-005

Todo pago podrá imputarse a una o varias cuotas.

---

## BR-PAYMENT-006

Una cuota podrá recibir múltiples pagos hasta completar su importe.

---

## BR-PAYMENT-007

Luego de cada imputación el sistema deberá actualizar automáticamente:

- monto abonado;
- saldo restante;
- estado de la cuota.

---

## BR-PAYMENT-008

El monto total imputado nunca podrá superar el importe registrado para el pago.

---

## BR-PAYMENT-009

El monto aplicado a una cuota nunca podrá superar el saldo pendiente de dicha cuota.

---

# Entrega Inicial

## BR-PAYMENT-010

Durante la entrega del producto el cobrador deberá registrar el cobro correspondiente a la primera cuota previamente generada.

---

## BR-PAYMENT-011

La primera cuota deberá encontrarse generada antes del proceso de entrega.

---

## BR-PAYMENT-012

El registro del primer pago será requisito para que la Administración pueda realizar el cierre definitivo de la venta.

---

# Auditoría

El sistema deberá registrar:

- cliente;
- venta;
- cuota(s) afectadas;
- empleado que registró el pago;
- fecha;
- monto;
- forma de pago;
- observaciones.

---

# Alcance Actual

Sprint 03

Incluye:

- registro de pagos;
- imputación de pagos a cuotas;
- pagos parciales;
- integración con Installments;
- trazabilidad de pagos.

Fuera de alcance:

- caja diaria;
- arqueos;
- conciliaciones bancarias;
- reversión de pagos;
- notas de crédito;
- integración con medios electrónicos.

---

# Estado

Documento vigente Sprint 03.