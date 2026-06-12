# Canarias System — Installments Business Rules

# Objetivo

Documentar las reglas de negocio relacionadas al concepto de cuotas dentro del sistema.

Este documento define el comportamiento esperado de las cuotas generadas a partir de una venta que utiliza una modalidad de financiacion. La configuracion fnanciera pertenece a un modulo futuro.

---

# Descripción

Una cuota representa una obligación de pago asociada a una venta aprobada.

Las cuotas serán utilizadas posteriormente para la gestión de cobranzas.

---

# Creación de Cuotas

## BR-INSTALLMENT-001

Las cuotas no se generan al momento de crear una venta.

---

## BR-INSTALLMENT-002

La generación de cuotas ocurre cuando una venta finaliza correctamente el proceso administrativo.

Flujo:

Venta creada

↓

Validación telefonica desde administracion

↓

Visita ambiental por parte del cobrador

↓

Aprobación / Rechazo administracion

↓

Coordinacion entrega (en caso de aprobacion)

↓

Entrega de producto + firma de contrato

↓

Cierre administrativo

↓

Generación de cuotas


---

# Relación con Venta

## BR-INSTALLMENT-003

Toda cuota pertenece a una venta.


Una venta tiene:

- múltiples cuotas

dependiendo de la configuración financiera futura.

---

# Estados Futuros

Las cuotas deberán contemplar estados operativos.

Ejemplos:

PENDING

PAID

OVERDUE

CANCELLED

---

# Cobranza

## BR-INSTALLMENT-004

Las cuotas serán utilizadas como fuente para futuros procesos de cobranza.

El módulo de cobranzas podrá consultar:

- cuotas pendientes
- vencimientos
- pagos realizados

---

# Restricciones

## BR-INSTALLMENT-005

Una cuota no debe existir asociada a una venta rechazada.

---

## BR-INSTALLMENT-006

Una cuota no debe modificarse manualmente fuera de procesos autorizados.

---

# Auditoría

Registrar:

- venta origen
- fecha de generación
- usuario/proceso creador
- cambios realizados


---

# Alcance Actual

Sprint 2:

- definición de entidad cuota
- relación venta-cuota
- estados base
- generacion de cuotas automaticas
- preparación para futuras cobranzas


Fuera de alcance actual:

- configuración de financiación
- planes de cuotas
- cálculo de intereses
- reglas avanzadas
- generación automática completa

---

# Estado

Documento vigente Sprint 02.