# Canarias System — Flujo de Cobranza

# Objetivo

Documentar el flujo operativo completo del proceso de cobranza.

El flujo contempla:

* generación cuotas
* asignación cobranzas
* hoja de ruta
* cobro cliente
* pagos parciales
* visitas fallidas
* cierre diario

---

# Roles Involucrados

| Rol       | Participación            |
| --------- | ------------------------ |
| COLLECTOR | Ejecuta cobranza         |
| ADMIN     | Supervisa y aprueba      |
| MANAGER   | Visualización financiera |

---

# Entidades Involucradas

* installment
* payment
* receipt
* route_sheet
* route_item
* failed_visit
* daily_closure
* cash_movement
* customer
* sale

---

# Objetivo Operativo

Gestionar el cobro diario/semanal de cuotas financiadas.

---

# Flujo Operativo

---

# Paso 1 — Generación Cuotas

## Responsable

Sistema

---

# Disparador

Venta aprobada.

---

# Resultado

El sistema genera:

```text id="jlwm88"
installments
```

---

# Información Generada

* monto cuota
* vencimiento
* estado
* saldo pendiente
* cliente asociado

---

# Estado Inicial Cuota

```text id="jlwm89"
PENDING
```

---

# Paso 2 — Asignación Cobranza

## Responsable

ADMIN

---

# Acción

Administración asigna:

* cobrador
* hoja ruta
* fecha cobranza
* sociedad

---

# Resultado

Se genera:

```text id="jlwm90"
route_item
```

tipo:

```text id="jlwm91"
COLLECTION
```

---

# Regla Operativa

Las cobranzas podrán reasignarse manualmente según:

* zona
* disponibilidad cobrador
* ayuda operativa entre cobradores

---

# Paso 3 — Generación Hoja Ruta

## Responsable

Sistema + ADMIN

---

# Resultado

Se genera:

```text id="jlwm92"
route_sheet
```

---

# Contenido Hoja Ruta

* clientes cobrar
* cuotas pendientes
* entregas pendientes
* visitas pendientes

---

# Paso 4 — Inicio Recorrido

## Responsable

COLLECTOR

---

# Acción

El cobrador inicia jornada.

---

# Resultado

La hoja pasa a:

```text id="jlwm93"
IN_PROGRESS
```

---

# Paso 5 — Registro Cobro

## Responsable

COLLECTOR

---

# Acción

El cobrador registra:

* cliente
* cuota
* monto
* método pago
* observaciones

---

# Resultado

Se genera:

```text id="jlwm94"
payment
```

---

# Consecuencias Operativas

El sistema:

* actualiza cuota
* genera recibo
* impacta caja
* actualiza cierre diario

---

# Estados Pago

| Estado    | Descripción   |
| --------- | ------------- |
| COMPLETED | Pago completo |
| PARTIAL   | Pago parcial  |
| CANCELLED | Pago anulado  |

---

# Estados Cuota

| Estado  | Descripción |
| ------- | ----------- |
| PENDING | Pendiente   |
| PAID    | Pagada      |
| OVERDUE | Vencida     |
| PARTIAL | Parcial     |

---

# Paso 6 — Generación Recibo

## Responsable

Sistema

---

# Resultado

Se genera:

```text id="jlwm95"
receipt
```

---

# Información Recibo

* cliente
* cuotas pagadas
* monto
* cobrador
* fecha
* sociedad

---

# Paso 7 — Pago Parcial

## Responsable

COLLECTOR

---

# Regla Operativa

El sistema deberá permitir:

* pagos incompletos
* múltiples cuotas
* saldo restante

---

# Resultado

La cuota pasa a:

```text id="jlwm96"
PARTIAL
```

---

# Paso 8 — Visita Fallida

## Responsable

COLLECTOR

---

# Acción

Registrar:

* cliente ausente
* domicilio cerrado
* rechazo pago
* observaciones

---

# Resultado

Se genera:

```text id="jlwm97"
failed_visit
```

---

# Consecuencias Operativas

* queda historial operativo
* administración podrá reprogramar
* impacta métricas cobrador

---

# Paso 9 — Finalización Recorrido

## Responsable

COLLECTOR

---

# Acción

El cobrador finaliza hoja.

---

# Resultado

La hoja pasa a:

```text id="jlwm98"
COMPLETED
```

---

# Paso 10 — Cierre Diario

## Responsable

COLLECTOR

---

# Acción

Registrar:

* total efectivo
* observaciones
* resumen jornada

---

# Resultado

Se genera:

```text id="jlwm99"
daily_closure
```

---

# Estado Inicial Cierre

```text id="jlwm100"
PENDING_APPROVAL
```

---

# Paso 11 — Validación Administrativa

## Responsable

ADMIN

---

# Acción

Administración:

* recibe dinero
* valida montos
* aprueba cierre

---

# Resultado

El cierre pasa a:

```text id="jlwm101"
APPROVED
```

---

# Consecuencias Operativas

El sistema:

* confirma movimientos caja
* cierra jornada cobrador
* bloquea modificaciones

---

# Casos Especiales

---

# Cuotas Vencidas

Las cuotas vencidas pasarán automáticamente a:

```text id="jlwm102"
OVERDUE
```

---

# Reasignación Cobranza

Administración podrá:

* mover cuotas
* cambiar cobrador
* regenerar hoja ruta

---

# Pago Incorrecto

Administración podrá:

* anular pago
* corregir monto
* auditar modificación

---

# Validaciones Obligatorias

* cuota activa
* cliente válido
* hoja ruta activa
* cobrador autorizado

---

# Auditoría

Registrar:

* cobrador
* fecha
* modificaciones
* anulaciones
* pagos parciales
* visitas fallidas

---

# Métricas Operativas

El sistema calculará:

* efectividad cobranza
* mora
* dinero calle
* rendimiento cobradores
* visitas fallidas

---

# Escalabilidad Futura

Preparado para:

* QR payments
* Mercado Pago
* cobranza mobile
* geolocalización
* firma digital
* cobranza offline

---

# Estado Actual

Workflow aprobado para Fase 1.
