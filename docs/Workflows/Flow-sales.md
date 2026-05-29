# Canarias System — Flujo de Venta

# Objetivo

Documentar el flujo operativo completo del proceso de venta.

El flujo contempla:

* carga cliente
* carga venta
* validación administrativa
* visita ambiental
* aprobación
* preparación entrega
* generación cobranza

---

# Roles Involucrados

| Rol       | Participación          |
| --------- | ---------------------- |
| SELLER    | Genera cliente y venta |
| ADMIN     | Valida operación       |
| COLLECTOR | Entrega producto       |
| MANAGER   | Supervisión            |

---

# Entidades Involucradas

* customer
* sale
* sale_item
* product
* financing_configuration
* route_sheet
* route_item
* installment
* delivery
* validation

---

# Objetivo Comercial

Registrar una operación financiada que posteriormente será gestionada mediante cobranza semanal o diaria.

---

# Flujo Operativo

---

# Paso 1 — Alta Cliente

## Responsable

SELLER

---

# Acción

El vendedor registra:

* datos personales
* domicilio
* referencias
* zona
* sociedad

---

# Resultado

Se genera:

```text id="jlwm76"
customer
```

---

# Estado Inicial Cliente

```text id="jlwm77"
PENDING_VALIDATION
```

---

# Paso 2 — Registro Venta

## Responsable

SELLER

---

# Acción

El vendedor registra:

* producto vendido
* precio
* financiación
* observaciones
* dirección entrega

---

# Resultado

Se genera:

```text id="jlwm78"
sale
```

---

# Estado Inicial Venta

```text id="jlwm79"
PENDING_APPROVAL
```

---

# Regla Financiera

La financiación aplicada será:

1. específica producto
2. o configuración global activa

---

# Paso 3 — Validación Administrativa

## Responsable

ADMIN

---

# Acción

Administración revisa:

* datos cliente
* historial
* dirección
* documentación
* riesgo financiero

---

# Resultado

Se genera:

```text id="jlwm80"
validation
```

---

# Posibles Resultados

| Estado   | Resultado         |
| -------- | ----------------- |
| APPROVED | Continúa flujo    |
| REJECTED | Venta rechazada   |
| OBSERVED | Requiere revisión |

---

# Paso 4 — Visita Ambiental

## Responsable

ADMIN

---

# Objetivo

Validar entorno cliente físicamente.

---

# Información Validada

* domicilio real
* referencias
* condiciones generales
* capacidad pago estimada
* documenta DNI
* documenta servicio

---

# Resultado

Actualiza:

```text id="jlwm81"
validation
```

---

# Paso 5 — Aprobación Final

## Responsable

ADMIN

---

# Resultado

La venta pasa a:

```text id="jlwm82"
APPROVED
```

---

# Consecuencias Operativas

El sistema:

* genera cuotas
* genera entrega pendiente
* habilita hoja ruta
* habilita cobranza futura

---

# Paso 6 — Generación Entrega

## Responsable

Sistema + ADMIN

---

# Resultado

Se genera:

```text id="jlwm83"
delivery
```

---

# Estado Inicial Entrega

```text id="jlwm84"
PENDING
```

---

# Paso 7 — Asignación Hoja Ruta

## Responsable

ADMIN

---

# Acción

Administración asigna:

* cobrador
* sociedad
* zona
* fecha entrega

---

# Resultado

Se genera:

```text id="jlwm85"
route_sheet
```

---

# Paso 8 — Entrega Producto

## Responsable

COLLECTOR

---

# Acción

El cobrador:

* entrega producto
* confirma entrega
* registra observaciones

---

# Resultado

La venta pasa a:

```text id="jlwm86"
DELIVERED
```

---

# Paso 9 — Inicio Cobranza

## Resultado

Las cuotas pasan a:

```text id="jlwm87"
PENDING_COLLECTION
```

---

# Casos Especiales

---

# Rechazo Venta

La venta podrá:

* cancelarse
* observarse
* reenviarse revisión

---

# Reasignación Cobrador

Administración podrá modificar:

* cobrador
* zona
* hoja ruta

---

# Venta Sin Stock

Permitido para:

* Canarias 1
* Canarias 2
* Canarias Motos

---

# Validaciones Obligatorias

* cliente único DNI
* producto válido
* financiación activa
* sociedad activa

---

# Auditoría

Registrar:

* creador venta
* aprobador
* cobrador asignado
* cambios estado
* observaciones

---

# Escalabilidad Futura

Preparado para:

* firma digital
* scoring automático
* IA riesgo financiero
* tracking entregas
* aprobación remota

---

# Estado Actual

Workflow aprobado para Fase 1.
