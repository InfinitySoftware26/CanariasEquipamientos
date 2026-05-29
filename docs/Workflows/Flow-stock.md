# Canarias System — Flujo de Stock

# Objetivo

Documentar el flujo operativo completo de gestión stock e inventario.

El flujo contempla:

* ingreso productos
* movimientos stock
* entregas
* control inventario
* alertas stock bajo
* proveedores
* compras operativas

---

# Roles Involucrados

| Rol       | Participación           |
| --------- | ----------------------- |
| ADMIN     | Gestión inventario      |
| MANAGER   | Supervisión financiera  |
| COLLECTOR | Impacto entregas        |
| SELLER    | Consulta disponibilidad |

---

# Entidades Involucradas

* product
* stock
* stock_movement
* supplier
* supplier_payment
* delivery
* purchase
* society
* stock_alert

---

# Objetivo Operativo

Gestionar correctamente el inventario operativo y financiero de productos.

---

# Consideración Operativa Canarias

Las sociedades:

* Canarias 1
* Canarias 2
* Canarias Motos

operan principalmente bajo modalidad:

```text id="stk101"
venta contra compra
```

por lo tanto:

* stock NO será obligatorio
* productos podrán venderse sin existencia física inmediata
* el abastecimiento podrá realizarse posteriormente

---

# Consideración Especial

La sociedad:

```text id="stk102"
Canarias S.R.L.
```

sí operará bajo control stock tradicional.

---

# Flujo Operativo

---

# Paso 1 — Alta Producto

## Responsable

ADMIN

---

# Acción

Administración registra:

* nombre producto
* categoría
* proveedor
* precio contado
* financiación
* control stock
* stock mínimo
* sociedad

---

# Resultado

Se genera:

```text id="stk103"
product
```

---

# Estado Inicial Producto

```text id="stk104"
ACTIVE
```

---

# Paso 2 — Configuración Stock

## Responsable

ADMIN

---

# Acción

Definir si el producto:

* requiere control stock
* permite venta sin stock
* utiliza stock mínimo

---

# Resultado

Configuraciones persistidas en:

```text id="stk105"
product
```

---

# Campo Importante

```text id="stk106"
hasStockControl
```

---

# Reglas Operativas

| Valor | Comportamiento            |
| ----- | ------------------------- |
| true  | Control stock obligatorio |
| false | Venta permitida sin stock |

---

# Paso 3 — Ingreso Stock

## Responsable

ADMIN

---

# Acción

Registrar ingreso inventario:

* producto
* cantidad
* proveedor
* costo compra
* observaciones

---

# Resultado

Se genera:

```text id="stk107"
stock_movement
```

tipo:

```text id="stk108"
IN
```

---

# Consecuencias Sistema

El sistema:

* incrementa stock
* actualiza inventario
* recalcula alertas
* registra auditoría

---

# Paso 4 — Venta Producto

## Responsable

SELLER

---

# Acción

El vendedor registra venta producto.

---

# Validación Operativa

Si:

```text id="stk109"
hasStockControl = true
```

el sistema validará disponibilidad.

---

# Resultado Posible

| Resultado         | Acción         |
| ----------------- | -------------- |
| Stock suficiente  | Permitir venta |
| Sin stock         | Bloquear venta |
| Sin control stock | Permitir venta |

---

# Paso 5 — Preparación Entrega

## Responsable

ADMIN

---

# Acción

Administración organiza:

* disponibilidad producto
* compra proveedor
* logística entrega

---

# Consideración Operativa

Las compras suelen realizarse:

* jueves
* viernes

para entregas:

* sábado
* lunes

---

# Paso 6 — Descuento Stock

## Responsable

Sistema

---

# Disparador

Entrega confirmada.

---

# Condición

Si:

```text id="stk110"
hasStockControl = true
```

---

# Resultado

Se genera:

```text id="stk111"
stock_movement
```

tipo:

```text id="stk112"
OUT
```

---

# Consecuencias Sistema

El sistema:

* reduce stock
* actualiza inventario
* recalcula alertas
* actualiza métricas

---

# Paso 7 — Alertas Stock Bajo

## Responsable

Sistema

---

# Disparador

Stock actual menor a:

```text id="stk113"
minimumStock
```

---

# Resultado

Se genera:

```text id="stk114"
stock_alert
```

---

# Consecuencias Operativas

Administración podrá:

* reponer stock
* generar compra
* priorizar abastecimiento

---

# Paso 8 — Gestión Proveedores

## Responsable

ADMIN

---

# Acción

Administración podrá:

* registrar proveedores
* registrar pagos
* consultar historial compras
* consultar deuda proveedores

---

# Resultado

Se generan:

```text id="stk115"
supplier
supplier_payment
```

---

# Paso 9 — Ajustes Inventario

## Responsable

ADMIN

---

# Acción

Registrar:

* pérdidas
* roturas
* diferencias
* correcciones manuales

---

# Resultado

Se genera:

```text id="stk116"
stock_movement
```

tipo:

```text id="stk117"
ADJUSTMENT
```

---

# Casos Especiales

---

# Producto Sin Stock

Permitido para:

* Canarias 1
* Canarias 2
* Canarias Motos

---

# Producto Con Stock Obligatorio

Aplicará principalmente para:

```text id="stk118"
Canarias S.R.L.
```

---

# Reasignación Inventario

Futuro:

* múltiples depósitos
* transferencias stock
* stock entre sociedades

---

# Validaciones Obligatorias

* producto activo
* proveedor válido
* sociedad válida
* stock suficiente si aplica

---

# Auditoría

Registrar:

* movimientos stock
* usuario responsable
* modificaciones
* ajustes manuales
* ingresos inventario

---

# Métricas Operativas

El sistema calculará:

* stock actual
* productos críticos
* productos más vendidos
* rotación inventario
* valorización stock

---

# Seguridad

* JWT obligatorio
* permisos administrativos
* auditoría obligatoria

---

# Escalabilidad Futura

Preparado para:

* depósitos múltiples
* códigos barras
* QR inventory
* órdenes compra
* inventario mobile
* integración ecommerce
* control seriales
* importaciones Excel

---

# Estado Actual

Workflow aprobado para Fase 1.
