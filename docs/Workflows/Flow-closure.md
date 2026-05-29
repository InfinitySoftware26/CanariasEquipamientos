# Canarias System — Flujo de Cierre Diario

# Objetivo

Documentar el flujo operativo completo del cierre diario de cobranzas.

El flujo contempla:

* finalización jornada
* validación dinero recaudado
* cierre operativo
* aprobación administrativa
* impacto financiero

---

# Roles Involucrados

| Rol       | Participación          |
| --------- | ---------------------- |
| COLLECTOR | Genera cierre          |
| ADMIN     | Aprueba cierre         |
| MANAGER   | Supervisión financiera |

---

# Entidades Involucradas

* daily_closure
* payment
* receipt
* cash_movement
* route_sheet
* route_item
* collector
* society

---

# Objetivo Operativo

Consolidar diariamente la cobranza realizada por cada cobrador.

---

# Flujo Operativo

---

# Paso 1 — Finalización Recorrido

## Responsable

COLLECTOR

---

# Disparador

El cobrador finaliza su hoja de ruta.

---

# Resultado

La hoja pasa a:

```text id="jlwm117"
COMPLETED
```

---

# Paso 2 — Generación Cierre

## Responsable

COLLECTOR

---

# Acción

El cobrador registra:

* efectivo total
* cantidad cobranzas
* observaciones
* incidencias jornada

---

# Resultado

Se genera:

```text id="jlwm118"
daily_closure
```

---

# Estado Inicial

```text id="jlwm119"
PENDING_APPROVAL
```

---

# Información Consolidada

El sistema calcula automáticamente:

* pagos realizados
* cuotas cobradas
* entregas realizadas
* visitas fallidas
* dinero total
* rendición

---

# Paso 3 — Entrega Dinero

## Responsable

COLLECTOR + ADMIN

---

# Acción

El cobrador entrega físicamente:

* efectivo
* comprobantes
* documentación operativa

---

# Paso 4 — Validación Administrativa

## Responsable

ADMIN

---

# Acción

Administración verifica:

* dinero recibido
* pagos registrados
* diferencias
* inconsistencias

---

# Resultado Positivo

El cierre pasa a:

```text id="jlwm120"
APPROVED
```

---

# Consecuencias Operativas

El sistema:

* confirma caja
* registra movimientos
* bloquea modificaciones
* consolida métricas
* genera rendimiento

---

# Resultado Negativo

El cierre podrá pasar a:

```text id="jlwm121"
OBSERVED
```

---

# Motivos Observación

* faltante dinero
* pagos inconsistentes
* diferencias operativas
* errores carga

---

# Paso 5 — Impacto Caja

## Responsable

Sistema

---

# Resultado

Se generan:

```text id="jlwm122"
cash_movements
```

---

# Tipo Movimiento

```text id="jlwm123"
INCOME
```

---

# Consecuencias Financieras

* actualiza balance sociedad
* actualiza caja diaria
* actualiza reportes

---

# Paso 6 — Cierre Definitivo

## Responsable

Sistema

---

# Resultado

El cierre queda:

* auditado
* consolidado
* inmutable operativamente

---

# Casos Especiales

---

# Diferencias Caja

Administración podrá:

* observar cierre
* registrar incidencia
* corregir manualmente

---

# Pagos Incorrectos

Administración podrá:

* anular pago
* corregir cobranza
* reabrir cierre futuro

---

# Reapertura Cierre

Solo ADMIN podrá:

* reabrir cierre
* modificar montos
* corregir inconsistencias

---

# Validaciones Obligatorias

* hoja finalizada
* cobrador válido
* pagos existentes
* sociedad activa

---

# Auditoría

Registrar:

* aprobador
* fecha aprobación
* diferencias detectadas
* modificaciones
* reaperturas

---

# Métricas Operativas

El sistema calculará:

* rendimiento cobrador
* efectividad cobranza
* diferencias caja
* cierres pendientes

---

# Seguridad

* JWT obligatorio
* permisos por rol
* auditoría obligatoria

---

# Escalabilidad Futura

Preparado para:

* arqueo automático
* conciliación bancaria
* cierre digital
* firma electrónica
* IA detección inconsistencias

---

# Estado Actual

Workflow aprobado para Fase 1.
