# Canarias System — Payments Business Rules

**Documento actualizado Sprint 05**

# Objetivo

Documentar las reglas de negocio relacionadas con el registro de pagos efectuados por los clientes.

Este documento define el comportamiento esperado del módulo Payments, responsable de registrar todos los movimientos de dinero del sistema.

---

# Descripción

Un pago representa un movimiento económico realizado por un cliente para cancelar total o parcialmente una obligación pendiente.

Todo pago deberá quedar registrado independientemente de la cuota a la que sea imputado.

Los pagos representan dinero recibido.

No representan deuda.

Cuando el pago se realiza mediante transferencia bancaria, podrá aplicarse un recargo adicional del 21%, de acuerdo con las reglas definidas en este documento.

El recargo por transferencia constituye un importe separado del monto base del pago y no modifica el importe original de la cuota.

---

# Registro de Pagos

## BR-PAYMENT-001

Todo pago deberá estar asociado a un cliente.

---

## BR-PAYMENT-002

Todo pago deberá registrar:

* monto base;
* fecha;
* forma de pago;
* empleado que recibió el dinero.

Cuando corresponda, también deberá registrar el recargo aplicado por transferencia y el importe total efectivamente recibido.

---

## BR-PAYMENT-003

Un pago podrá originarse desde:

* la entrega inicial del producto;
* una cobranza domiciliaria;
* futuros procesos autorizados por el sistema.

---

## BR-PAYMENT-004

Todo pago deberá quedar registrado antes de ser imputado a una o varias cuotas.

---

# Recargo por Transferencia

## BR-PAYMENT-013

Cuando la forma de pago seleccionada sea **TRANSFERENCIA**, el sistema deberá permitir aplicar un recargo adicional del **21%** sobre el monto base del pago.

---

## BR-PAYMENT-014

El recargo por transferencia será **opcional**.

Al seleccionar la forma de pago TRANSFERENCIA, el sistema deberá mostrar la opción de aplicar el recargo del 21%.

La opción deberá encontrarse habilitada por defecto, pero el usuario autorizado podrá desactivarla antes de confirmar el pago.

Esto permite registrar transferencias con recargo o sin recargo según la situación operativa.

---

## BR-PAYMENT-015

El recargo por transferencia deberá calcularse como un importe separado del monto base del pago.

Ejemplo:

```text
Monto base:                 $100.000
Recargo transferencia 21%:  $ 21.000
Total recibido:             $121.000
```

Cuando el recargo sea desactivado:

```text
Monto base:                 $100.000
Recargo transferencia:      $  0
Total recibido:             $100.000
```

---

## BR-PAYMENT-016

El recargo por transferencia no deberá modificar el importe original de la cuota.

La cuota continuará teniendo su importe y saldo correspondientes al monto base que se imputa.

El recargo representa un importe adicional cobrado por el medio de pago.

---

## BR-PAYMENT-017

Cuando el pago sea parcial, el recargo deberá calcularse sobre el monto base efectivamente cobrado en esa operación, siempre que el recargo se encuentre habilitado.

---

## BR-PAYMENT-018

Cuando la forma de pago no sea TRANSFERENCIA, no deberá aplicarse el recargo del 21%.

---

## BR-PAYMENT-019

El sistema deberá conservar por separado:

* monto base del pago;
* recargo por transferencia;
* total efectivamente recibido;
* forma de pago;
* indicación de si el recargo fue aplicado.

Esto permitirá mantener trazabilidad financiera y diferenciar el dinero correspondiente al pago del importe adicional generado por la transferencia.

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

* monto abonado;
* saldo restante;
* estado de la cuota.

---

## BR-PAYMENT-008

El monto total imputado nunca podrá superar el importe registrado para el pago.

---

## BR-PAYMENT-009

El monto aplicado a una cuota nunca podrá superar el saldo pendiente de dicha cuota.

---

## Regla específica sobre el recargo

El recargo por transferencia no deberá contabilizarse como parte del importe de la cuota ni utilizarse para incrementar el saldo de la cuota.

Ejemplo:

```text
Cuota pendiente:            $100.000

Pago mediante transferencia:
Monto aplicado a cuota:     $100.000
Recargo transferencia:       $21.000
Total recibido:             $121.000

Saldo de cuota:                  $0
```

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

# Integración con Cobranzas

## BR-PAYMENT-020

Cuando un cobrador registre un pago desde el flujo de cobranza, deberá poder seleccionar la forma de pago.

Si selecciona TRANSFERENCIA, deberá poder visualizar y controlar la aplicación del recargo del 21% antes de confirmar la operación.

---

## BR-PAYMENT-021

El cálculo y registro del recargo pertenecen al proceso de Payments.

El módulo Collections deberá utilizar el resultado del pago registrado y no implementar una lógica independiente para calcular el recargo.

---

# Integración con Route Sheets

## BR-PAYMENT-022

Los Route Sheet Items no serán responsables de calcular ni administrar el recargo por transferencia.

Los Route Sheet Items continúan representando las operaciones correspondientes al recorrido, como:

* cuota;
* visita;
* entrega;
* entrega con primera cuota.

---

## BR-PAYMENT-023

Cuando desde un Route Sheet Item se inicie un cobro, el usuario deberá acceder al flujo de registro de pago correspondiente.

La selección de TRANSFERENCIA y la aplicación opcional del recargo deberán resolverse dentro del flujo de Payments/Collections.

---

## BR-PAYMENT-024

Una vez registrado el pago, el detalle de la hoja de ruta podrá mostrar el resultado del cobro, incluyendo cuando corresponda:

* forma de pago;
* monto base;
* recargo por transferencia;
* total cobrado.

La hoja de ruta no deberá duplicar ni recalcular estos valores.

---

# Integración con Caja

## BR-PAYMENT-025

Cuando un pago mediante transferencia sea registrado correctamente, el importe deberá quedar identificado como transferencia para su posterior control financiero.

---

## BR-PAYMENT-026

El importe correspondiente al recargo deberá conservarse separado del monto base del pago.

La información deberá permitir que Caja diferencie:

```text
Monto base de cobranza
+
Recargo por transferencia
=
Total recibido
```

---

## BR-PAYMENT-027

Caja deberá poder identificar los ingresos provenientes de transferencias de forma diferenciada respecto de los ingresos en efectivo.

El detalle y la visualización de Caja podrán utilizar esta información para mostrar los totales de transferencias por períodos, sin modificar la lógica de imputación de cuotas.

---

# Auditoría

El sistema deberá registrar:

* cliente;
* venta;
* cuota(s) afectadas;
* empleado que registró el pago;
* fecha;
* monto base;
* forma de pago;
* recargo por transferencia, cuando corresponda;
* total efectivamente recibido;
* indicación de si el recargo fue aplicado;
* observaciones.

---

# Alcance Actual

Sprint 05

Incluye:

* registro de pagos;
* imputación de pagos a cuotas;
* pagos parciales;
* integración con Installments;
* trazabilidad de pagos;
* selección de forma de pago;
* recargo opcional del 21% para transferencias;
* separación entre monto base, recargo y total recibido;
* integración con Cobranzas;
* integración con Route Sheets;
* identificación de transferencias para Caja.

Fuera de alcance:

* caja diaria;
* arqueos;
* conciliaciones bancarias;
* reversión de pagos;
* notas de crédito;
* integración con medios electrónicos;
* reportes específicos de recargos por transferencia.

---

# Estado

Documento actualizado Sprint 05.
