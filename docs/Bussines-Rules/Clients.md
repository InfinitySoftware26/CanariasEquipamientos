# Canarias System — Clients Business Rules

# Objetivo

Documentar las reglas de negocio relacionadas a la gestión de clientes dentro del sistema.

Este documento define los comportamientos, restricciones y validaciones correspondientes al ciclo de vida de un cliente.

---

# Descripción

Un cliente representa una persona que realiza una o más operaciones comerciales con la empresa.

El cliente constituye el punto de partida del proceso de venta y podrá mantener múltiples ventas activas, un historial comercial y un estado de comportamiento asociado.

---

# Reglas de Creación

## BR-CLIENT-001

Todo cliente deberá registrarse antes de completar una venta.

---

## BR-CLIENT-002

El registro inicial del cliente se realiza como primera etapa del proceso de venta.

Flujo:

Cliente

↓

Selección de producto

↓

Venta

---

## BR-CLIENT-003

Cuando un vendedor registra una venta para un cliente inexistente, el sistema deberá crear automáticamente el cliente antes de generar la venta.

---

## BR-CLIENT-004

Si el cliente ya existe, el sistema reutilizará el registro existente y asociará la nueva venta al mismo.

No deberán generarse clientes duplicados.

---

# Validación Administrativa

## BR-CLIENT-005

La administración deberá validar la información registrada durante el proceso de venta.

La validación podrá contemplar:

* datos personales;
* domicilio;
* teléfono;
* documentación presentada.

---

## BR-CLIENT-006

Una venta podrá continuar su flujo únicamente cuando el cliente haya sido validado administrativamente.

---

# Asociación Comercial

## BR-CLIENT-007

Un cliente podrá tener múltiples ventas asociadas.

---

## BR-CLIENT-008

Todas las ventas deberán conservar la referencia al cliente original.

La eliminación lógica de una venta no deberá afectar la información del cliente.

---

# Información Principal

## BR-CLIENT-009

La pantalla principal del cliente deberá mostrar un resumen comercial con la información más relevante para la operatoria diaria.

Como mínimo deberá contemplar:

* estado general;
* cantidad de ventas activas;
* cantidad de cuotas pendientes;
* cuota actual;
* estado de pago.

Los detalles completos permanecerán disponibles dentro de la ficha individual del cliente.

---

# Historial Comercial

## BR-CLIENT-010

Todo cliente dispondrá de un historial comercial.

El historial permitirá registrar información relacionada con su comportamiento operativo.

Entre otros aspectos:

* cumplimiento de pagos;
* cuotas vencidas;
* historial de ventas;
* comportamiento general.

---

## BR-CLIENT-011

El sistema deberá permitir clasificar el comportamiento comercial del cliente a partir de su historial.

Esta clasificación servirá como apoyo para futuras decisiones comerciales y administrativas.

---

# Búsquedas

## BR-CLIENT-012

El sistema deberá permitir localizar clientes mediante distintos criterios de búsqueda.

Como mínimo:

* nombre y apellido;
* DNI;
* teléfono;
* domicilio.

---

# Estados

## BR-CLIENT-013

El estado comercial del cliente será calculado a partir de su historial operativo.

La clasificación podrá evolucionar durante futuras etapas del proyecto.

---

# Auditoría

El sistema deberá registrar:

* creación del cliente;
* modificaciones;
* usuario responsable;
* fecha de creación;
* fecha de actualización.

---

# Estado

Documento vigente.

Implementado:

✅ Creación automática durante el proceso de venta.

✅ Asociación de ventas al cliente.

Implementación parcial:

🟡 Validación administrativa.

🟡 Resumen comercial del cliente.

Pendiente:

* Historial comercial.
* Clasificación por comportamiento de pago.
* Búsqueda por domicilio.
* Indicadores comerciales.
