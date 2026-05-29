# Canarias System — Flujo de Entrega

# Objetivo

Documentar el flujo operativo completo del proceso de entrega de productos.

El flujo contempla:

* preparación entrega
* asignación cobrador
* hoja de ruta
* entrega producto
* validación entrega
* control operativo
* actualización estados

---

# Roles Involucrados

| Rol       | Participación         |
| --------- | --------------------- |
| ADMIN     | Organiza entregas     |
| COLLECTOR | Realiza entrega       |
| SELLER    | Consulta estado venta |
| MANAGER   | Supervisión           |

---

# Entidades Involucradas

* sale
* product
* delivery
* route_sheet
* route_item
* stock_movement
* customer
* society

---

# Objetivo Operativo

Gestionar correctamente la entrega física de productos vendidos.

---

# Flujo Operativo

---

# Paso 1 — Venta Aprobada

## Responsable

ADMIN

---

# Disparador

La venta fue validada y aprobada.

---

# Resultado

La venta pasa a:

```text id="jlwm103"
APPROVED
```

---

# Consecuencias Operativas

El sistema:

* habilita entrega
* genera cuotas
* habilita hoja ruta

---

# Paso 2 — Generación Entrega

## Responsable

Sistema

---

# Resultado

Se genera:

```text id="jlwm104"
delivery
```

---

# Estado Inicial Entrega

```text id="jlwm105"
PENDING
```

---

# Información Asociada

* cliente
* producto
* dirección
* sociedad
* observaciones

---

# Paso 3 — Preparación Operativa

## Responsable

ADMIN

---

# Acción

Administración organiza:

* fecha entrega
* cobrador asignado
* disponibilidad producto
* logística operativa

---

# Regla Operativa

Las entregas podrán asignarse a:

* cualquier cobrador
* cualquier sociedad operativa

según necesidad logística.

---

# Paso 4 — Asignación Hoja Ruta

## Responsable

ADMIN

---

# Acción

Administración agrega entrega a:

```text id="jlwm106"
route_sheet
```

---

# Resultado

Se genera:

```text id="jlwm107"
route_item
```

tipo:

```text id="jlwm108"
DELIVERY
```

---

# Paso 5 — Inicio Recorrido

## Responsable

COLLECTOR

---

# Acción

El cobrador inicia jornada.

---

# Resultado

La hoja pasa a:

```text id="jlwm109"
IN_PROGRESS
```

---

# Paso 6 — Entrega Producto

## Responsable

COLLECTOR

---

# Acción

El cobrador:

* entrega producto
* confirma recepción
* registra observaciones

---

# Resultado

La entrega pasa a:

```text id="jlwm110"
DELIVERED
```

---

# Consecuencias Operativas

La venta pasa a:

```text id="jlwm111"
DELIVERED
```

---

# Consecuencias Sistema

El sistema:

* habilita cobranza activa
* registra historial entrega
* impacta métricas operativas

---

# Paso 7 — Impacto Stock

## Responsable

Sistema

---

# Regla Operativa

Si el producto posee:

```text id="jlwm112"
hasStockControl = true
```

el sistema deberá:

* descontar stock
* generar stock movement

---

# Resultado

Se genera:

```text id="jlwm113"
stock_movement
```

tipo:

```text id="jlwm114"
OUT
```

---

# Regla Especial Canarias

Las sociedades:

* Canarias 1
* Canarias 2
* Canarias Motos

podrán operar sin stock obligatorio.

---

# Paso 8 — Finalización Operativa

## Responsable

COLLECTOR

---

# Acción

El cobrador finaliza recorrido.

---

# Resultado

La hoja pasa a:

```text id="jlwm115"
COMPLETED
```

---

# Casos Especiales

---

# Cliente Ausente

El cobrador podrá registrar:

```text id="jlwm116"
FAILED_DELIVERY
```

---

# Consecuencias

* reprogramar entrega
* mantener venta activa
* generar observación operativa

---

# Producto No Disponible

Administración podrá:

* reprogramar entrega
* cambiar fecha
* cambiar producto futuro

---

# Reasignación Cobrador

La entrega podrá:

* cambiar cobrador
* cambiar hoja ruta
* cambiar sociedad operativa

---

# Validaciones Obligatorias

* venta aprobada
* cliente válido
* hoja activa
* cobrador autorizado

---

# Auditoría

Registrar:

* cobrador entrega
* fecha entrega
* observaciones
* reprogramaciones
* cambios operativos

---

# Métricas Operativas

El sistema calculará:

* entregas realizadas
* entregas pendientes
* entregas fallidas
* efectividad operativa

---

# Seguridad

* JWT obligatorio
* permisos por rol
* filtrado sociedad

---

# Escalabilidad Futura

Preparado para:

* firma digital cliente
* fotografía entrega
* tracking GPS
* geolocalización
* app mobile
* entregas offline

---

# Estado Actual

Workflow aprobado para Fase 1.
