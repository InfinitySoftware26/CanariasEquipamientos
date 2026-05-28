# Canarias System — Business Rules — Ventas

# Objetivo

Definir las reglas de negocio relacionadas al proceso de ventas financiadas dentro del sistema.

---

# Actores Involucrados

* Vendedor
* Administrador
* Cliente
* Gerente

---

# Descripción General

El sistema permitirá registrar ventas financiadas de productos mediante cuotas semanales o diarias.

Toda venta deberá pasar por un proceso de validación administrativa antes de considerarse aprobada.

---

# Flujo General de Venta

```text
Vendedor registra cliente
        ↓
Vendedor registra venta
        ↓
Sistema genera venta pendiente
        ↓
Administración realiza visita ambiental
        ↓
Administración aprueba/rechaza
        ↓
Venta aprobada
        ↓
Asignación de entrega/cobranza
```

---

# Estados de Venta

| Estado           | Descripción                 |
| ---------------- | --------------------------- |
| PENDING_APPROVAL | Venta pendiente de revisión |
| APPROVED         | Venta aprobada              |
| REJECTED         | Venta rechazada             |
| DELIVERED        | Producto entregado          |
| ACTIVE           | Venta activa                |
| COMPLETED        | Venta finalizada            |
| CANCELLED        | Venta cancelada             |

---

# Reglas de Negocio

---

## BR-SALES-001

Toda venta debe ser creada por un vendedor o administrador.

---

## BR-SALES-002

Toda venta inicia en estado:

```text
PENDING_APPROVAL
```

---

## BR-SALES-003

La aprobación administrativa es obligatoria.

---

## BR-SALES-004

El vendedor NO puede aprobar ventas.

---

## BR-SALES-005

Toda venta debe estar asociada a:

* cliente
* producto
* sociedad
* vendedor

---

## BR-SALES-006

La visita ambiental es obligatoria antes de aprobar la venta.

---

## BR-SALES-007

Un cliente con mora crítica podrá ser bloqueado para nuevas ventas.

---

## BR-SALES-008

La venta aprobada deberá generar automáticamente:

* plan de cuotas
* deuda inicial
* cronograma de pagos

---

## BR-SALES-009

Una venta aprobada pasará automáticamente a estado:

```text
APPROVED
```

---

## BR-SALES-010

Una venta entregada pasará a:

```text
ACTIVE
```

---

# Validaciones

| Validación                 | Obligatoria |
| -------------------------- | ----------- |
| Cliente existente          | Sí          |
| Producto válido            | Sí          |
| Sociedad asignada          | Sí          |
| Vendedor asignado          | Sí          |
| Configuración financiación | Sí          |

---

# Restricciones

* No se permiten ventas sin cliente.
* No se permiten ventas sin producto.
* No se permiten ventas sin sociedad.
* No se permiten ventas sin financiación configurada.

---

# Consideraciones Operativas

* Las ventas pueden generar entregas futuras.
* Las entregas aparecerán en hojas de ruta.
* Un cobrador puede encargarse de entrega y cobranza.

---

# Riesgos Operativos

* Clientes duplicados
* Sobreendeudamiento
* Ventas sin validación
* Errores de financiación

---

# Consideraciones Técnicas

* Las reglas críticas deben validarse en backend.
* El frontend solo actuará como capa visual.
* Todos los cambios de estado deben auditarse.

---

# Auditoría

El sistema deberá registrar:

* usuario creador
* usuario aprobador
* fecha creación
* fecha aprobación
* cambios de estado
* observaciones administrativas
