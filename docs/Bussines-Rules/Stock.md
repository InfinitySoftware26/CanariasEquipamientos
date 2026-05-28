# Canarias System — Business Rules — Stock

# Objetivo

Definir las reglas de negocio relacionadas a productos, inventario y control de stock.

---

# Descripción General

El sistema deberá permitir administrar productos, stock disponible y control operativo de inventario según el modelo comercial de cada sociedad.

El negocio posee una modalidad híbrida:

* venta bajo demanda
* stock parcial
* productos recuperados
* stock físico permanente en futuras sociedades

---

# Tipos de Productos

| Tipo      | Descripción         |
| --------- | ------------------- |
| NEW       | Producto nuevo      |
| RECOVERED | Producto recuperado |
| USED      | Producto usado      |
| RESERVED  | Producto reservado  |

---

# Reglas Generales

---

## BR-STOCK-001

Todo producto debe pertenecer a una sociedad.

---

## BR-STOCK-002

Los productos pueden venderse incluso sin stock físico inmediato.

---

## BR-STOCK-003

Canarias 1 y Canarias 2 operan principalmente bajo compra post-venta.

---

## BR-STOCK-004

Canarias S.R.L. manejará stock físico permanente.

---

## BR-STOCK-005

Los productos recuperados deben volver automáticamente al inventario.

---

# Control de Stock

---

## BR-STOCK-006

El sistema debe registrar:

* ingresos
* egresos
* entregas
* recuperos
* ajustes manuales

---

## BR-STOCK-007

Toda entrega debe impactar stock automáticamente.

---

## BR-STOCK-008

Todo recupero debe reingresar stock automáticamente.

---

## BR-STOCK-009

Los movimientos de stock deben auditarse.

---

# Alertas

---

## BR-STOCK-010

El sistema deberá generar alertas de stock bajo.

---

## BR-STOCK-011

Las alertas deberán visualizarse en dashboards administrativos.

---

# Proveedores

---

## BR-STOCK-012

Los productos podrán asociarse a proveedores.

---

## BR-STOCK-013

Las compras deberán permitir futuras integraciones financieras.

---

# Restricciones

* No se permiten productos sin sociedad.
* No se permiten movimientos sin trazabilidad.
* No se permiten eliminaciones físicas de productos críticos.

---

# Consideraciones Operativas

* Parte del stock se adquiere semanalmente.
* Las entregas suelen concentrarse sábado y lunes.
* Los cobradores participan en entregas.

---

# Consideraciones Técnicas

* Los movimientos deberán almacenarse en tabla independiente.
* Todo ajuste deberá auditarse.
* El sistema deberá soportar stock multi-depósito futuro.

---

# Riesgos Operativos

* Pérdida de productos
* Stock negativo
* Movimientos duplicados
* Productos entregados no registrados

---

# Auditoría

Registrar:

* usuario
* fecha
* tipo movimiento
* sociedad
* producto
* observaciones
