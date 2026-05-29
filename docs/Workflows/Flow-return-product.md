# Canarias System — Flujo de Recupero de Producto

# Objetivo

Documentar el flujo operativo completo de recupero de deuda.

El flujo contempla:

* gestión mora
* seguimiento clientes
* recupero deuda
* refinanciación futura
* control riesgo financiero

---

# Roles Involucrados

| Rol       | Participación          |
| --------- | ---------------------- |
| ADMIN     | Gestión recupero       |
| COLLECTOR | Gestión cobranza       |
| MANAGER   | Supervisión financiera |

---

# Entidades Involucradas

* installment
* payment
* failed_visit
* customer
* sale
* collection_assignment
* route_sheet
* notification

---

# Objetivo Operativo

Gestionar clientes con deuda vencida o riesgo financiero.

---

# Flujo Operativo

---

# Paso 1 — Detección Mora

## Responsable

Sistema

---

# Disparador

Cuota vencida sin pago.

---

# Resultado

La cuota pasa a:

```text id="’wini133"
OVERDUE
```

---

# Consecuencias Operativas

El sistema:

* marca cliente moroso
* impacta reportes
* habilita seguimiento recupero

---

# Paso 2 — Generación Gestión Recupero

## Responsable

Sistema + ADMIN

---

# Resultado

La cobranza pasa a:

```text id="’wini134"
RECOVERY_PROCESS
```

---

# Paso 3 — Asignación Recupero

## Responsable

ADMIN

---

# Acción

Administración asigna:

* cobrador
* prioridad
* hoja ruta especial

---

# Resultado

Se genera:

```text id="’wini135"
collection_assignment
```

---

# Paso 4 — Gestión Cliente

## Responsable

COLLECTOR

---

# Acción

El cobrador realiza:

* visitas
* llamados futuros
* seguimiento deuda
* negociación futura

---

# Resultado

Se registran:

```text id="’wini136"
failed_visit
observations
```

---

# Paso 5 — Pago Recupero

## Responsable

COLLECTOR

---

# Acción

El cliente realiza:

* pago parcial
* pago total

---

# Resultado

Se genera:

```text id="’wini137"
payment
```

---

# Consecuencias Sistema

* actualiza deuda
* actualiza mora
* actualiza dinero calle

---

# Paso 6 — Regularización

## Responsable

Sistema

---

# Condición

Cliente cancela deuda pendiente.

---

# Resultado

El cliente sale de:

```text id="’wini138"
RECOVERY_PROCESS
```

---

# Casos Especiales

---

# Cliente Incobrable

Administración podrá marcar:

```text id="’wini139"
UNRECOVERABLE
```

---

# Consecuencias

* permanece auditado
* excluido cobranzas activas
* impacta balances

---

# Refinanciación

Preparado para futura implementación:

```text id="’wini140"
refinancing
```

---

# Reasignación Recupero

Administración podrá:

* cambiar cobrador
* cambiar prioridad
* cambiar zona

---

# Validaciones Obligatorias

* cuota vencida
* cliente activo
* deuda existente

---

# Auditoría

Registrar:

* visitas recupero
* observaciones
* acuerdos futuros
* pagos parciales
* cambios estado

---

# Métricas Operativas

El sistema calculará:

* mora total
* recupero mensual
* clientes críticos
* efectividad recupero

---

# Seguridad

* JWT obligatorio
* permisos restringidos

---

# Escalabilidad Futura

Preparado para:

* scoring riesgo
* refinanciación automática
* IA recupero
* notificaciones WhatsApp
* gestión jurídica

---

# Estado Actual

Workflow aprobado para Fase 1.
