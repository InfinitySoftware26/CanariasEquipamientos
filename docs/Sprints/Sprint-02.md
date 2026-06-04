# Canarias System — Sprint 02

# Fecha Sprint Review

19/06/2026

---

# Duración Sprint

08/06/2026 → 19/06/2026

---

# Objetivo General

Construcción completa del dominio comercial.

El objetivo es dejar operativo:

* gestión de zonas
* asignación de empleados a sociedades
* asignación de empleados a zonas
* validación administrativa de ventas
* generación y administración de cuotas

---

# Eventos Sprint

| Fecha | Evento               |
| ----- | -------------------- |
| 08/06 | Daily                |
| 10/06 | Daily                |
| 12/06 | Daily                |
| 15/06 | Daily                |
| 17/06 | Daily                |
| 18/06 | Pre-Demo QA          |
| 19/06 | Sprint Review + Demo |

---

# Entidades Sprint

* zones
* staff_zones
* staff_societys
* sale_validations
* installments

---

# Backend Tasks

## Zones Module

* CRUD zonas
* activación/desactivación zonas
* asignación de clientes a zona
* validaciones de cobertura

---

## Staff Zones Module

* asignación de cobradores a zonas
* asignación de vendedores a zonas
* validaciones de disponibilidad
* restricciones por sociedad

---

## Staff Societies Module

* asignación de empleados a sociedades
* validaciones multi-sociedad
* restricciones de acceso por sociedad
* auditoría de asignaciones

---

## Sale Validations Module

* aprobación de ventas
* rechazo de ventas
* observaciones administrativas
* historial de validaciones
* estados de validación

---

## Installments Module

* generación automática de cuotas
* cálculo de vencimientos
* cálculo de importes
* estados de cuota
* validaciones de financiación

---

# API Endpoints

## Zones

### POST /zones

### GET /zones

### GET /zones/:id

### PATCH /zones/:id

---

## Staff Zones

### POST /staff-zones

### GET /staff-zones

### DELETE /staff-zones/:id

---

## Staff Societies

### POST /staff-societies

### GET /staff-societies

### DELETE /staff-societies/:id

---

## Sale Validations

### POST /sale-validations

### GET /sale-validations

### PATCH /sale-validations/:id

---

## Installments

### GET /installments

### GET /installments/:id

### PATCH /installments/:id

---

# Frontend Tasks

## Zones UI

* alta zona
* edición zona
* listado zonas
* detalle zona

---

## Staff Assignment UI

* asignación de cobradores
* asignación de vendedores
* asignación a sociedades
* visualización de relaciones

---

## Sale Validation UI

* listado ventas pendientes
* aprobación venta
* rechazo venta
* observaciones administrativas

---

## Installments UI

* listado cuotas
* detalle cuota
* estados de cuota
* cronograma de vencimientos

---

# QA

## Validaciones

* creación zona
* asignación empleado-zona
* asignación empleado-sociedad
* aprobación venta
* rechazo venta
* generación automática cuotas
* cálculo vencimientos
* estados cuota

---

# Riesgos

| Riesgo                        | Mitigación                      |
| ----------------------------- | ------------------------------- |
| reglas comerciales cambiantes | validación continua con cliente |
| complejidad de cuotas         | pruebas tempranas               |
| asignaciones incorrectas      | validaciones automáticas        |

---

# Entregables

* zonas operativas
* asignaciones de empleados funcionales
* validación administrativa de ventas
* cuotas generadas automáticamente
* flujo comercial preparado para cobranza

---

# Sprint Goal

Proceso comercial validado y estructurado para iniciar la operación de cobranzas.
