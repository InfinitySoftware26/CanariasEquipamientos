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

# Plata en calle

La plata en calle representa el importe financiado que todavía permanece pendiente de cobro.

Una venta financiada incorpora inicialmente su importe financiado a la plata en calle.

Ejemplo

Venta:

20 cuotas;
$100.000 por cuota.

Total financiado:

$2.000.000

Plata en calle inicial:

$2.000.000

---

# Retiro por falta de pago

El retiro se produce como consecuencia de incumplimiento de pago.

La condición definida es:

Dos cuotas consecutivas impagas.

Al cumplirse la condición:

Se genera una notificación interna a Administración.
Administración puede gestionar el retiro.
Cuando el producto queda registrado como retirado, el saldo pendiente de esa venta deja de formar parte de la plata en calle.

---

# Retiro y deuda histórica

El retiro no debe borrar:

la venta;
los pagos realizados;
las cuotas históricas;
la información del cliente.

Debe conservarse la trazabilidad de la operación.

El saldo pendiente existente al momento del retiro deja de computarse como plata en calle según la regla comercial definida.

---

# Cobranza semanal

El control semanal de Caja debe contemplar las nuevas ventas realizadas durante la semana.

No debe considerar únicamente los cobros efectuados.

La información debe permitir explicar la variación de plata en calle durante el período.

--- 

# Diferencias

Una diferencia entre el importe esperado y el declarado debe quedar registrada.

No debe corregirse silenciosamente ni eliminarse el movimiento que originó la diferencia.

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

---

# Estado

Documento actualizado Sprint 05.