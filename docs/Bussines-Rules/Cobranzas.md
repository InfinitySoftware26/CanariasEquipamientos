# Canarias System — Business Rules — Cobranzas

# Objetivo

Definir las reglas de negocio vinculadas al proceso de cobranzas, cuotas, pagos y cierres diarios.

---

# Actores Involucrados

* Cobrador
* Administrador
* Cliente
* Gerente

---

# Descripción General

El sistema permitirá gestionar el seguimiento de cuotas financiadas mediante cobranzas presenciales realizadas por cobradores asignados.

---

# Flujo General

```text
Venta activa
    ↓
Generación de cuotas
    ↓
Asignación hoja de ruta
    ↓
Cobranza diaria
    ↓
Registro de pago
    ↓
Cierre diario
    ↓
Validación administrativa
```

---

# Estados de Cuota

| Estado    | Descripción     |
| --------- | --------------- |
| PENDING   | Cuota pendiente |
| PAID      | Cuota abonada   |
| OVERDUE   | Cuota vencida   |
| PARTIAL   | Pago parcial    |
| CANCELLED | Cuota cancelada |

---

# Estados de Cobranza

| Estado       | Descripción      |
| ------------ | ---------------- |
| PENDING      | Pendiente        |
| COLLECTED    | Cobrada          |
| FAILED_VISIT | Visita frustrada |
| RESCHEDULED  | Reprogramada     |

---

# Reglas de Negocio

---

## BR-COLLECTIONS-001

Toda cuota debe pertenecer a una venta activa.

---

## BR-COLLECTIONS-002

Las cobranzas deben registrarse únicamente desde hojas de ruta asignadas.

---

## BR-COLLECTIONS-003

Un cobrador solo puede registrar pagos de clientes asignados.

---

## BR-COLLECTIONS-004

Toda cobranza debe generar trazabilidad financiera.

---

## BR-COLLECTIONS-005

El sistema debe calcular automáticamente:

* deuda restante
* cuotas pendientes
* mora
* total abonado

---

## BR-COLLECTIONS-006

Las cuotas vencidas deben pasar automáticamente a estado:

```text
OVERDUE
```

---

## BR-COLLECTIONS-007

Dos cuotas consecutivas impagas podrán habilitar recupero del producto.

---

## BR-COLLECTIONS-008

Toda visita frustrada deberá registrarse.

---

## BR-COLLECTIONS-009

Todo cobrador debe realizar cierre diario.

---

## BR-COLLECTIONS-010

La administración debe aprobar manualmente las rendiciones.

---

# Validaciones

| Validación          | Obligatoria |
| ------------------- | ----------- |
| Cuota existente     | Sí          |
| Cliente asignado    | Sí          |
| Hoja de ruta activa | Sí          |
| Cobrador asignado   | Sí          |

---

# Mora

El sistema deberá:

* identificar atrasos
* calcular deuda acumulada
* generar alertas operativas

---

# Visitas Frustradas

Las visitas frustradas deberán registrar:

* fecha
* cobrador
* motivo
* observaciones

---

# Cierres Diarios

Todo cierre deberá contener:

* monto declarado
* cantidad de cobros
* incidencias
* observaciones

---

# Restricciones

* No se permiten pagos negativos.
* No se permiten pagos sobre cuotas canceladas.
* No se permiten cierres duplicados.

---

# Consideraciones Técnicas

* Los cálculos financieros deben realizarse en backend.
* Toda cobranza debe impactar caja automáticamente luego de la aprobacin del administrador.
* Toda operación debe auditarse.

---

# Auditoría

Registrar:

* usuario
* fecha
* cuota/s
* importe
* método pago
* observaciones
