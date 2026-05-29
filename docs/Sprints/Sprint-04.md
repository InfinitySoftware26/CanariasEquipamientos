# Canarias System — Sprint 04

# Fecha Sprint Review

17/07/2026

---

# Duración Sprint

06/07/2026 → 17/07/2026

---

# Objetivo General

Automatizar completamente la operación diaria de cobradores y administración.

Este sprint busca dejar operativo:

* hojas de ruta
* entregas
* asignaciones
* cierres diarios
* movimientos caja

---

# Eventos Sprint

| Fecha | Evento               |
| ----- | -------------------- |
| 06/07 | Daily                |
| 08/07 | Daily                |
| 10/07 | Daily                |
| 13/07 | Daily                |
| 15/07 | Daily                |
| 16/07 | Pre-Demo QA          |
| 17/07 | Sprint Review + Demo |

---

# Entidades Sprint

* route_sheet
* route_item
* delivery
* daily_closure
* cash_movement

---

# Objetivos Técnicos

## Backend

* generación hojas ruta
* asignación cobradores
* entregas
* cierre diario
* validación admin
* auditoría movimientos

---

## Frontend

* dashboard cobrador
* hoja ruta diaria
* pantalla entregas
* cierre jornada
* validación administrativa

---

# Backend Tasks

## Route Sheets Module

### Funcionalidades

* generar hoja diaria
* asignar cobrador
* asignar entregas
* agrupar por sociedad
* agrupar por zona

---

## Route Items

### Funcionalidades

* cuotas asignadas
* entregas pendientes
* estados recorrido

---

## Deliveries Module

### Funcionalidades

* registrar entrega
* observaciones entrega
* estados entrega
* validación entrega

---

## Daily Closures Module

### Funcionalidades

* cierre cobrador
* total efectivo
* observaciones cierre
* diferencias caja
* validación admin

---

## Cash Movements

### Funcionalidades

* ingresos
* egresos
* auditoría
* historial movimientos

---

# API Endpoints

## Route Sheets

### POST /route-sheets/generate

Generar hoja ruta.

---

### GET /route-sheets

Listado hojas ruta.

---

## Deliveries

### POST /deliveries

Registrar entrega.

---

## Daily Closures

### POST /daily-closures

Registrar cierre.

---

### PATCH /daily-closures/:id/approve

Aprobar cierre.

---

# Frontend Tasks

## Collector Dashboard

* hoja ruta diaria
* cobranzas asignadas
* entregas asignadas
* resumen jornada

---

## Deliveries UI

* confirmar entrega
* estados entrega
* observaciones

---

## Closures UI

* cierre diario
* resumen efectivo
* diferencias caja
* observaciones

---

## Admin UI

* validar cierres
* aprobar cierres
* visualizar diferencias

---

# QA

## Validaciones

* generación hoja ruta
* entregas
* cierre diario
* diferencias caja
* validación admin

---

# Riesgos

| Riesgo               | Mitigación            |
| -------------------- | --------------------- |
| errores caja         | doble validación      |
| inconsistencias ruta | testing operativo     |
| diferencias efectivo | auditoría movimientos |

---

# Entregables

* operación diaria automatizada
* hojas ruta funcionales
* entregas operativas
* cierres diarios funcionales

---

# Sprint Goal

Automatizar completamente la operación diaria del negocio.
