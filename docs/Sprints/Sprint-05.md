# Canarias System — Sprint 05

# Fecha Sprint Review

31/07/2026

---

# Duración Sprint

20/07/2026 → 31/08/2026

---

# Objetivo General

Consolidar completamente:

* stock
* proveedores
* finanzas
* balances
* reportes
* notificaciones

Este sprint tiene como objetivo transformar el sistema en una plataforma administrativa completa.

---

# Eventos Sprint

| Fecha | Evento               |
| ----- | -------------------- |
| 20/07 | Daily                |
| 22/07 | Daily                |
| 24/07 | Daily                |
| 27/07 | Daily                |
| 29/07 | Daily                |
| 30/07 | Pre-Demo QA          |
| 31/07 | Sprint Review + Demo |

---

# Entidades Sprint

* stock
* stock_movement
* stock_alert
* supplier
* supplier_payment
* cash_box
* report
* notification

---

# Objetivos Técnicos

## Backend

* control stock
* movimientos stock
* balances financieros
* pagos proveedores
* reportes operativos
* sistema notificaciones

---

## Frontend

* dashboard stock
* dashboard finanzas
* dashboard gerencial
* proveedores
* balances
* reportes

---

# Backend Tasks

## Stock Module

### Funcionalidades

* stock actual
* ingresos stock
* egresos stock
* movimientos históricos
* alertas stock mínimo
* control inventario

---

## Business Rules

### Reglas

* productos Canarias 1 y 2 pueden venderse sin stock
* productos Canarias S.R.L. requieren stock real
* alertas críticas configurables

---

## Suppliers Module

### Funcionalidades

* CRUD proveedores
* pagos proveedores
* deuda proveedor
* historial pagos
* movimientos asociados

---

## Cash Box Module

### Funcionalidades

* caja por sociedad
* ingresos
* egresos
* balances diarios
* balances mensuales

---

## Reports Module

### Reportes

* dinero en calle
* ventas diarias
* cobranzas diarias
* balances sociedad
* mora clientes
* productividad cobradores
* productividad vendedores

---

## Notifications Module

### Funcionalidades

* alertas mora
* alertas stock
* eventos sistema
* avisos administrativos

---

# API Endpoints

## Stock

### GET /stock

Listado stock.

---

### POST /stock/movements

Registrar movimiento.

---

## Suppliers

### POST /suppliers

Alta proveedor.

---

### POST /supplier-payments

Registrar pago proveedor.

---

## Cash Boxes

### GET /cash-boxes

Listado cajas.

---

### POST /cash-movements

Registrar movimiento.

---

## Reports

### GET /reports/street-money

Dinero en calle.

---

### GET /reports/daily-sales

Ventas diarias.

---

# Frontend Tasks

## Stock UI

* panel stock
* tabla movimientos
* alertas visuales
* filtros stock

---

## Suppliers UI

* listado proveedores
* pagos
* deuda
* historial proveedor

---

## Cash UI

* dashboard cajas
* balances
* movimientos financieros

---

## Reports UI

* dashboard gerente
* gráficos
* KPIs
* tablas reportes

---

## Notifications UI

* campana notificaciones
* alertas visuales
* estados notificaciones

---

# QA

## Validaciones

* movimientos stock
* balances
* reportes
* pagos proveedores
* alertas sistema

---

# Riesgos

| Riesgo                      | Mitigación            |
| --------------------------- | --------------------- |
| inconsistencias financieras | auditoría movimientos |
| errores stock               | validaciones fuertes  |
| reportes lentos             | optimización queries  |

---

# Entregables

* stock operativo
* balances funcionales
* reportes iniciales
* notificaciones funcionando

---

# Sprint Goal

Sistema administrativo completamente consolidado.
