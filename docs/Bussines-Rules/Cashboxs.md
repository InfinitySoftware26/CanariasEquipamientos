# Canarias System — Business Rules — Cajas

# Objetivo

Definir las reglas de negocio relacionadas a cajas, movimientos financieros y rendiciones operativas.

---

# Descripción General

El sistema manejará cajas independientes por sociedad, permitiendo registrar ingresos, egresos y cierres financieros diarios.

La trazabilidad financiera constituye una funcionalidad crítica del sistema.

---

# Componentes Financieros

* caja
* movimientos
* ingresos
* egresos
* rendiciones
* cierres
* saldo

---

# Reglas Generales

---

## BR-CASH-001

Cada sociedad debe poseer una caja independiente.

---

## BR-CASH-002

Toda cobranza aprobada debe impactar en caja correspondiente automáticamente.

---

## BR-CASH-003

Todo ingreso/egreso debe registrarse manualmente.

---

## BR-CASH-004

Los movimientos financieros deben auditarse obligatoriamente.

---

# Tipos de Movimiento

| Tipo       | Descripción    |
| ---------- | -------------- |
| INCOME     | Ingreso        |
| EXPENSE    | Egreso         |
| COLLECTION | Cobranza       |
| PAYMENT    | Pago proveedor |
| ADJUSTMENT | Ajuste manual  |

---

# Cierres Diarios

---

## BR-CASH-005

Todo cobrador debe generar cierre diario.

---

## BR-CASH-006

La administración debe validar manualmente cada cierre.

---

## BR-CASH-007

Los cierres deben registrar:

* monto declarado
* cantidad cobros
* incidencias
* observaciones

---

# Rendiciones

---

## BR-CASH-008

Las rendiciones deben asociarse al cobrador responsable.

---

## BR-CASH-009

No se permite aprobar rendiciones duplicadas.

---

# Restricciones

* No se permiten movimientos sin sociedad.
* No se permiten movimientos negativos inválidos.
* No se permiten cierres duplicados.
* No se permiten eliminaciones físicas de movimientos financieros.

---

# Consideraciones Operativas

* Cada sociedad opera financieramente de forma independiente.
* Las rendiciones pueden ocurrir al día siguiente.
* Administración valida físicamente el dinero.

---

# Consideraciones Técnicas

* Toda operación debe ser transaccional.
* Los cálculos financieros deben realizarse en backend.
* Los movimientos deben ser inmutables.
* Los balances deberán recalcularse automáticamente.

---

# Riesgos Operativos

* Diferencias de caja
* Cobros no rendidos
* Duplicación financiera
* Pérdida de trazabilidad

---

# Auditoría

Registrar:

* usuario
* fecha
* sociedad
* tipo movimiento
* importe
* observaciones
* aprobador

---

# Consideraciones Futuras

Futuras versiones podrán incorporar:

* conciliación automática
* integración bancaria
* exportación contable
* arqueos digitales
* dashboards financieros avanzados
