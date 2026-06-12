# Canarias System — Business Rules — Financiación

# Objetivo

Definir las reglas de negocio vinculadas a financiación, cuotas, intereses y condiciones comerciales.

---

# Descripción General

El sistema permitirá gestionar ventas financiadas mediante planes de cuotas configurables.

La financiación constituye uno de los módulos críticos del negocio.

---

# Componentes de Financiación

* monto financiado
* interés
* cantidad cuotas
* frecuencia cuotas
* mora
* deuda restante
* pagos parciales

---

# Frecuencia de Cuotas

| Tipo   | Descripción      |
| ------ | ---------------- |
| DAILY  | Cuotas diarias   |
| WEEKLY | Cuotas semanales |

---

# Reglas Generales

---

## BR-FINANCE-001

Toda venta financiada debe generar cuotas automáticamente.

---

## BR-FINANCE-002

Las cuotas deben calcularse según el plan configurado.

---

## BR-FINANCE-003

La financiación puede variar según producto.

---

## BR-FINANCE-004

El administrador puede modificar condiciones financieras.

---

## BR-FINANCE-005

El sistema debe calcular automáticamente:

* saldo pendiente
* deuda restante
* interés acumulado
* cuotas pagadas

---

# Mora

---

## BR-FINANCE-006

Las cuotas vencidas generan mora automáticamente.

---

## BR-FINANCE-007

La mora puede generar restricciones operativas.

---

## BR-FINANCE-008

Clientes con mora crítica podrán bloquear nuevas ventas.

---

# Refinanciación

---

## BR-FINANCE-009

Las refinanciaciones deberán generar nuevo cronograma.

---

## BR-FINANCE-010

Toda refinanciación debe quedar auditada.

---

# Pagos Parciales

---

## BR-FINANCE-011

El sistema debe permitir pagos parciales.

---

## BR-FINANCE-012

Los pagos parciales impactan saldo pendiente.

---

# Restricciones

* No se permiten cuotas negativas.
* No se permiten intereses negativos.
* No se permiten ventas sin financiación válida.

---

# Consideraciones Técnicas

* Los cálculos financieros deben ejecutarse en backend.
* Los montos deben almacenarse con precisión decimal.
* Las reglas financieras deben centralizarse en services específicos.

---

# Riesgos Operativos

* Cálculos incorrectos
* Inconsistencias financieras
* Refinanciaciones erróneas
* Duplicación de cuotas

---

# Auditoría

Registrar:

* cambios de financiación
* refinanciaciones
* modificaciones administrativas
* ajustes manuales
