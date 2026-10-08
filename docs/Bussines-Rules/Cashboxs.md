# Canarias System — Business Rules — Cajas

# Objetivo

Definir las reglas de negocio relacionadas a la gestión de cajas, cuentas financieras, cierres, rendiciones y saldos de cada sociedad.

---

# Descripción General

El sistema manejará la gestión financiera de forma independiente por sociedad.

La caja permitirá controlar el dinero disponible, sus movimientos y los saldos resultantes de la operación diaria.

El sistema utilizará un modelo básico y configurable de cuentas financieras, permitiendo representar:

* caja operativa;
* cuentas utilizadas por la sociedad;
* cuentas destinadas a fondos de gestión.

La gestión financiera del sistema no reemplazará la administración contable completa de la empresa.

---

# Componentes Financieros

* caja
* cuentas
* movimientos
* transferencias
* rendiciones
* cierres
* saldos
* resumen financiero

---

# Reglas Generales

---

## BR-CASH-001

Cada sociedad deberá mantener su gestión financiera de forma independiente.

Los movimientos y saldos de una sociedad no deberán mezclarse con los de otra.

---

## BR-CASH-002

La caja operativa deberá permitir registrar un saldo inicial al momento de su apertura.

---

## BR-CASH-003

Una sociedad no deberá mantener más de una caja operativa abierta al mismo tiempo.

---

## BR-CASH-004

El cierre de una caja no implica retirar físicamente todo el dinero disponible.

El saldo existente al finalizar un período podrá mantenerse para el siguiente período.

Ejemplo:

```text
Día 1
Saldo final: $60.000

Día 2
Saldo inicial: $60.000
```

El traspaso del saldo entre días representa continuidad financiera y no un movimiento de transferencia.

---

# Saldos

---

## BR-CASH-005

El saldo de una cuenta deberá calcularse a partir de:

```text
Saldo inicial
+
Ingresos
-
Egresos
-
Transferencias salientes
+
Transferencias entrantes
```

---

## BR-CASH-006

El sistema deberá calcular el saldo financiero en backend.

Los valores mostrados en el resumen no deberán depender de cálculos manuales realizados en frontend.

---

## BR-CASH-007

El resumen financiero deberá representar información calculada a partir de los saldos y movimientos registrados.

El resumen no deberá almacenarse como un movimiento independiente.

---

## BR-CASH-008

Al cerrar una caja el sistema deberá conservar:

* saldo inicial;
* saldo calculado por el sistema;
* saldo declarado al cierre;
* fecha de cierre.

Cuando corresponda, deberá poder identificarse la diferencia entre el saldo calculado y el saldo declarado.

---

# Cierres Diarios

---

## BR-CASH-009

El cierre de caja representa el cierre de un período operativo.

El cierre no elimina movimientos ni reinicia el dinero disponible.

---

## BR-CASH-010

El siguiente período podrá comenzar utilizando como saldo inicial el saldo disponible del período anterior.

---

# Rendiciones

---

## BR-CASH-011

Todo cobrador deberá realizar un cierre diario de su jornada de cobranza.

---

## BR-CASH-012

La administración deberá validar la rendición correspondiente antes de que la cobranza rendida impacte financieramente como ingreso de la sociedad.

---

## BR-CASH-013

Una rendición deberá asociarse al cobrador responsable y conservar la trazabilidad de la cobranza realizada.

---

## BR-CASH-014

Una misma rendición no podrá generar más de un impacto financiero.

---

## BR-CASH-015

Cuando una rendición sea validada, el dinero rendido deberá registrarse como ingreso en la cuenta financiera correspondiente.

El movimiento deberá conservar la referencia a la rendición y al cierre que le dieron origen.

---

# Cuentas Financieras

---

## BR-CASH-016

Las cuentas financieras deberán ser configurables por sociedad.

El sistema no deberá depender de nombres de cuentas definidos en código.

---

## BR-CASH-017

Una sociedad podrá disponer de distintas cuentas financieras según sus necesidades operativas.

Por ejemplo:

* caja;
* cuenta bancaria;
* cuenta de Mercado Pago;
* fondo de gestión.

---

## BR-CASH-018

Las cuentas deberán permitir identificar como mínimo:

* sociedad;
* nombre;
* estado;
* tipo o finalidad de la cuenta.

---

# Fondo de Gestión

---

## BR-CASH-019

La sociedad podrá disponer de una cuenta destinada a conservar fondos administrados exclusivamente por los responsables de gestión.

Esta cuenta se identificará como:

```text
Fondo de Gestión
```

No se utilizará el concepto de "ahorro" dentro del sistema.

---

## BR-CASH-020

El ADMIN podrá transferir dinero desde una cuenta operativa hacia el Fondo de Gestión cuando exista un importe disponible para reservar.

La transferencia deberá quedar registrada y auditada.

---

## BR-CASH-021

El ADMIN podrá visualizar que el dinero fue transferido al Fondo de Gestión y deberá poder consultar la información necesaria para documentar la operación.

El ADMIN no podrá consultar:

* saldo total del Fondo de Gestión;
* saldo disponible del Fondo de Gestión;
* egresos internos del Fondo de Gestión;
* detalle financiero interno administrado por los gerentes.

---

## BR-CASH-022

El MANAGER y el SUPER_ADMIN podrán consultar el saldo y los movimientos del Fondo de Gestión.

---

## BR-CASH-023

Los egresos realizados desde el Fondo de Gestión deberán quedar registrados como movimientos financieros asociados a dicha cuenta.

---

## BR-CASH-024

Los movimientos del Fondo de Gestión deberán mantener la misma trazabilidad financiera que el resto de las cuentas.

La restricción será de acceso y visibilidad, no de auditoría.

---

# Transferencias

---

## BR-CASH-025

Una transferencia representa un movimiento real de dinero entre dos cuentas financieras.

Toda transferencia deberá identificar:

* cuenta origen;
* cuenta destino;
* importe;
* concepto;
* usuario responsable;
* fecha.

---

## BR-CASH-026

Una transferencia no modifica el dinero total de la sociedad.

Únicamente modifica la distribución del dinero entre cuentas.

Ejemplo:

```text
Cuenta operativa: $500.000
Fondo de Gestión: $0

Transferencia: $100.000

Cuenta operativa: $400.000
Fondo de Gestión: $100.000

Total sociedad: $500.000
```

---

## BR-CASH-027

Los movimientos de dinero entre cuentas no deberán confundirse con el saldo inicial o final de una caja.

El saldo que permanece de un día al siguiente no genera una transferencia.

---

# Restricciones

* No se permiten movimientos sin sociedad.
* No se permiten saldos o importes financieros negativos inválidos.
* No se permiten transferencias sin cuenta origen y cuenta destino.
* No se permiten transferencias por importes superiores al saldo disponible de la cuenta origen.
* No se permiten cierres duplicados.
* No se permiten rendiciones duplicadas.
* No se permiten eliminaciones físicas de movimientos financieros.
* No se deberá permitir que un usuario acceda a información financiera restringida por su rol.

---

# Consideraciones Operativas

* Cada sociedad administra sus propios fondos.
* La caja operativa mantiene continuidad de saldo entre períodos.
* Las rendiciones de cobradores pueden realizarse posteriormente al cierre de la jornada.
* Administración valida la rendición antes de su impacto financiero.
* Las cuentas permiten representar diferentes lugares o medios donde se encuentra el dinero.
* El Fondo de Gestión será administrado por MANAGER y SUPER_ADMIN.
* La empresa podrá continuar utilizando Excel para controles administrativos y financieros que no formen parte del alcance inicial.

---

# Consideraciones Técnicas

* Los cálculos financieros deberán realizarse en backend.
* Las operaciones financieras deberán mantener trazabilidad.
* Los movimientos deberán ser inmutables.
* Los saldos deberán calcularse a partir de los movimientos registrados.
* Las restricciones de acceso al Fondo de Gestión deberán aplicarse en backend y no únicamente en frontend.
* Las operaciones críticas deberán ejecutarse de forma transaccional.
* El modelo deberá permitir agregar nuevas cuentas sin modificar la lógica de negocio principal.

---

# Riesgos Operativos

* Diferencias entre dinero declarado y dinero calculado.
* Rendiciones no realizadas.
* Rendiciones duplicadas.
* Transferencias incorrectas.
* Movimientos sin trazabilidad.
* Acceso no autorizado a fondos de gestión.

---

# Auditoría

Registrar:

* usuario;
* fecha;
* sociedad;
* cuenta;
* tipo de operación;
* importe;
* concepto;
* cuenta origen;
* cuenta destino cuando corresponda;
* referencia a la operación relacionada;
* aprobador cuando corresponda.

---

# Consideraciones Futuras

Futuras versiones podrán incorporar:

* gestión financiera detallada;
* mayor clasificación de gastos;
* gestión completa de compras;
* control financiero avanzado;
* indicadores de rentabilidad;
* gestión de salarios;
* gestión de comisiones;
* gestión de anticipos;
* gestión de rendimientos financieros;
* inversiones;
* automatización de reportes actualmente realizados en Excel;
* integración con otros sistemas financieros o contables.

La conciliación bancaria automática no forma parte del alcance definido para el proyecto.

---

# Estado

Documento actualizado Sprint 05.

Alcance definido para la primera versión:

* caja por sociedad;
* cuentas financieras básicas;
* apertura y cierre;
* saldos;
* movimientos;
* transferencias;
* rendiciones;
* impacto financiero de rendiciones validadas;
* Fondo de Gestión con acceso restringido;
* resumen financiero básico.

El detalle financiero y administrativo actualmente gestionado mediante Excel permanecerá parcialmente fuera del sistema hasta futuras versiones.
