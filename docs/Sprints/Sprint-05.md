# Canarias System — Sprint 05

# Fecha Sprint Review

07/08/2026

---

# Duración Sprint

20/07/2026 → 31/07/2026

---

# Objetivo General

Construcción completa del dominio financiero y de abastecimiento.

El objetivo es dejar operativo:

* gestión de productos
* gestión de proveedores
* pagos a proveedores
* gestión de caja
* movimientos financieros
* emisión de recibos
* reportes financieros

---

# Eventos Sprint

| Fecha | Evento |
|--------|--------|
| 20/07 | Daily |
| 22/07 | Daily |
| 24/07 | Daily |
| 27/07 | Daily |
| 29/07 | Daily |
| 30/07 | Pre-Demo QA |
| 31/07 | Sprint Review + Demo |

---

# Entidades Sprint

* products
* suppliers
* supplier_payments
* cashbox
* cash_movements
* receipts

---

# Backend Tasks

## Products Module

* CRUD productos
* categorías
* precios
* activación/desactivación
* validaciones comerciales

---

## Suppliers Module

* CRUD proveedores
* información comercial
* historial operaciones
* asociación a sociedades

---

## Supplier Payments Module

* pagos proveedores
* control deuda proveedor
* historial pagos
* validaciones financieras

---

## Cashbox Module

* apertura caja
* cierre caja
* saldo actual
* validaciones operativas

---

## Cash Movements Module

* ingresos
* egresos
* transferencias internas
* auditoría movimientos

---

## Receipts Module

* generación recibos
* numeración automática
* asociación pagos
* emisión PDF

---

## Reports Module

* cierre de caja PDF
* movimientos financieros Excel
* pagos a proveedores Excel
* exportación de recibos PDF
* reportes administrativos

---

# API Endpoints

## Products

### POST /products

### GET /products

### GET /products/:id

### PATCH /products/:id

---

## Suppliers

### POST /suppliers

### GET /suppliers

### PATCH /suppliers/:id

---

## Supplier Payments

### POST /supplier-payments

### GET /supplier-payments

---

## Cashbox

### POST /cashbox

### GET /cashbox

### GET /cashbox/:id

---

## Cash Movements

### POST /cash-movements

### GET /cash-movements

---

## Receipts

### POST /receipts

### GET /receipts

### GET /receipts/:id

---

## Reports

### GET /reports/cashbox/pdf

### GET /reports/cash-movements/excel

### GET /reports/supplier-payments/excel

### GET /reports/receipts/pdf

---

# Frontend Tasks

## Products UI

* alta producto
* edición producto
* listado productos
* administración precios

---

## Suppliers UI

* alta proveedor
* edición proveedor
* listado proveedores
* detalle proveedor

---

## Supplier Payments UI

* registrar pago
* historial pagos
* deuda proveedor
* resumen financiero

---

## Cashbox UI

* apertura caja
* cierre caja
* movimientos caja
* resumen financiero

---

## Receipts UI

* emisión recibo
* impresión recibo
* historial recibos
* búsqueda recibos

---

## Reports UI

* exportar cierre caja PDF
* exportar movimientos Excel
* exportar pagos proveedores Excel
* exportar recibos PDF

---

# QA

## Validaciones

* alta producto
* edición producto
* alta proveedor
* pago proveedor
* apertura caja
* cierre caja
* generación recibos
* movimientos financieros
* generación PDF
* generación Excel

---

# Riesgos

| Riesgo | Mitigación |
|----------|----------|
| diferencias financieras | conciliación administrativa |
| errores recibos | validaciones automáticas |
| inconsistencias proveedores | auditoría de pagos |
| cambios catálogo productos | parametrización flexible |
| generación reportes | validación con usuarios finales |

---

# Entregables

* productos administrables
* gestión proveedores operativa
* pagos proveedores funcionales
* caja operativa
* recibos automáticos
* reportes financieros PDF y Excel

---

# Sprint Goal

Administración financiera y de abastecimiento completamente integrada al sistema.