# Canarias System — Business Rules — Movimientos de Caja

# Objetivo

Definir las reglas de negocio relacionadas al registro de movimientos financieros de las cuentas de cada sociedad.

---

# Descripción General

Un movimiento de caja representa una operación financiera que modifica el saldo de una cuenta.

Los movimientos deberán permitir registrar de forma simple y trazable:

* ingresos;
* egresos;
* transferencias entre cuentas.

Los movimientos constituyen la base para el cálculo de los saldos financieros.

---

# Tipos de Movimiento

| Tipo     | Descripción                 |
| -------- | --------------------------- |
| INCOME   | Ingreso de dinero           |
| EXPENSE  | Egreso de dinero            |
| TRANSFER | Transferencia entre cuentas |

---

# Reglas Generales

---

## BR-MOVEMENT-001

Todo movimiento deberá pertenecer a una sociedad.

---

## BR-MOVEMENT-002

Todo movimiento deberá estar asociado a una cuenta financiera.

En el caso de una transferencia deberán identificarse la cuenta origen y la cuenta destino.

---

## BR-MOVEMENT-003

Todo movimiento deberá registrar:

* tipo;
* importe;
* concepto;
* usuario responsable;
* fecha.

---

## BR-MOVEMENT-004

Los importes de los movimientos deberán ser positivos.

El tipo de movimiento determinará si el importe suma o resta del saldo.

---

# Ingresos

---

## BR-MOVEMENT-005

Un movimiento de tipo:

```text
INCOME
```

representa dinero que ingresa a una cuenta.

El importe deberá incrementar el saldo de dicha cuenta.

---

## BR-MOVEMENT-006

Los ingresos provenientes de cobranzas deberán conservar la referencia a la operación que originó el dinero.

Cuando corresponda deberán poder relacionarse con:

* pago;
* rendición;
* cierre del cobrador.

---

## BR-MOVEMENT-007

La aprobación de una rendición no deberá generar más de un ingreso financiero para la misma operación.

El sistema deberá evitar duplicaciones financieras.

---

# Egresos

---

## BR-MOVEMENT-008

Un movimiento de tipo:

```text
EXPENSE
```

representa dinero que sale de una cuenta.

El importe deberá disminuir el saldo de dicha cuenta.

---

## BR-MOVEMENT-009

Todo egreso deberá registrar un concepto que permita identificar el motivo de la operación.

---

## BR-MOVEMENT-010

Los pagos realizados a proveedores podrán conservar la referencia al pago correspondiente.

Esto permitirá mantener trazabilidad entre la operación administrativa y el movimiento financiero.

---

# Transferencias

---

## BR-MOVEMENT-011

Un movimiento de tipo:

```text
TRANSFER
```

representa el traslado de dinero entre dos cuentas financieras.

---

## BR-MOVEMENT-012

Toda transferencia deberá identificar:

* cuenta origen;
* cuenta destino;
* importe;
* concepto;
* usuario responsable;
* fecha.

---

## BR-MOVEMENT-013

Una transferencia deberá disminuir el saldo de la cuenta origen y aumentar el saldo de la cuenta destino.

---

## BR-MOVEMENT-014

Una transferencia interna no deberá modificar el dinero total disponible de la sociedad.

Solo deberá modificar su distribución entre cuentas.

---

## BR-MOVEMENT-015

El traspaso del saldo de una jornada a la siguiente no deberá registrarse como transferencia.

El saldo inicial de una nueva jornada deberá representar la continuidad del saldo anterior.

---

# Fondo de Gestión

---

## BR-MOVEMENT-016

El sistema deberá permitir realizar transferencias desde una cuenta operativa hacia el Fondo de Gestión.

Estas transferencias deberán registrarse como:

```text
TRANSFER
```

y deberán identificar la cuenta origen y la cuenta de destino.

---

## BR-MOVEMENT-017

Los movimientos realizados dentro del Fondo de Gestión deberán conservar su trazabilidad financiera.

---

## BR-MOVEMENT-018

Los egresos realizados desde el Fondo de Gestión deberán registrarse como:

```text
EXPENSE
```

asociados a dicha cuenta.

---

## BR-MOVEMENT-019

Los movimientos internos del Fondo de Gestión solo podrán ser consultados y administrados por:

* MANAGER;
* SUPER_ADMIN.

El ADMIN podrá registrar transferencias hacia el Fondo de Gestión, pero no podrá consultar su saldo ni sus egresos internos.

---

# Relación con Cobranzas

---

## BR-MOVEMENT-020

El registro de un pago de cliente representa una cobranza realizada.

El movimiento financiero de la sociedad deberá producirse dentro del flujo de rendición correspondiente, evitando registrar dos veces el mismo dinero.

---

## BR-MOVEMENT-021

Cuando la administración valide una rendición, el sistema deberá generar o confirmar el movimiento financiero correspondiente en la cuenta definida para recibir la cobranza.

El movimiento deberá mantener referencia a la rendición y al cierre que lo originaron.

---

# Saldos

---

## BR-MOVEMENT-022

Los movimientos deberán utilizarse para calcular el saldo de cada cuenta.

La fórmula básica será:

```text
Saldo inicial
+
INCOME
-
EXPENSE
-
TRANSFER saliente
+
TRANSFER entrante
```

---

## BR-MOVEMENT-023

El frontend no deberá calcular ni modificar directamente los saldos financieros.

Los cálculos deberán realizarse en backend.

---

# Restricciones

* No se permiten movimientos sin sociedad.
* No se permiten importes negativos.
* No se permiten movimientos sin concepto.
* No se permiten transferencias sin cuenta origen.
* No se permiten transferencias sin cuenta destino.
* No se permiten transferencias superiores al saldo disponible de la cuenta origen.
* No se permiten movimientos financieros duplicados para una misma operación.
* No se permiten eliminaciones físicas de movimientos.
* No se permite acceder a movimientos restringidos del Fondo de Gestión sin autorización correspondiente.

---

# Consideraciones Operativas

* Los movimientos representan operaciones reales de dinero.
* Los ingresos aumentan el saldo.
* Los egresos disminuyen el saldo.
* Las transferencias redistribuyen dinero entre cuentas.
* El saldo que permanece de un día al siguiente no genera un movimiento.
* Las cobranzas deberán mantener trazabilidad desde el pago hasta la rendición y su impacto financiero.
* Los movimientos relacionados con proveedores deberán poder identificarse.
* La empresa podrá continuar utilizando Excel para controles financieros detallados que no formen parte del alcance inicial.

---

# Consideraciones Técnicas

* Los movimientos deberán almacenarse de forma independiente.
* Los cálculos financieros deberán realizarse en backend.
* Los movimientos deberán ser inmutables.
* Toda operación deberá conservar trazabilidad.
* Las transferencias deberán procesarse de forma transaccional.
* Las relaciones con pagos, rendiciones y proveedores deberán permitir identificar el origen del movimiento.
* Las restricciones de acceso al Fondo de Gestión deberán aplicarse en backend.

---

# Riesgos Operativos

* Movimientos duplicados.
* Transferencias incorrectas.
* Egresos sin concepto.
* Ingresos no asociados a su operación de origen.
* Diferencias entre saldo calculado y dinero físico.
* Acceso no autorizado a movimientos del Fondo de Gestión.

---

# Auditoría

Registrar:

* usuario;
* fecha;
* sociedad;
* cuenta;
* tipo de movimiento;
* importe;
* concepto;
* cuenta origen;
* cuenta destino;
* operación relacionada;
* observaciones cuando correspondan.

---

# Consideraciones Futuras

Futuras versiones podrán incorporar:

* clasificación avanzada de gastos;
* categorías financieras;
* gestión detallada de compras;
* automatización de controles actualmente realizados mediante Excel;
* análisis de rentabilidad;
* indicadores financieros avanzados;
* gestión de salarios;
* gestión de comisiones;
* gestión de anticipos;
* gestión de inversiones;
* reportes financieros avanzados.

El sistema mantendrá el modelo de movimientos como base para permitir estas extensiones sin modificar la lógica financiera principal.

---

# Estado

Documento actualizado Sprint 05.

Alcance definido para la primera versión:

* INCOME;
* EXPENSE;
* TRANSFER;
* cuentas financieras;
* saldo calculado;
* transferencias internas;
* impacto de rendiciones validadas;
* trazabilidad de pagos y proveedores;
* Fondo de Gestión con acceso restringido.

La gestión financiera detallada que actualmente se realiza mediante Excel continuará fuera del alcance inicial.
