# Canarias System — Sprint 03

# Fecha Sprint Review

13/07/2026

---

# Duración Sprint

22/06/2026 → 03/07/2026

---

# Objetivo General

Construcción del flujo operativo de cobranzas.

El objetivo es dejar operativo:

* generación de hojas de ruta
* asignación de cobradores
* organización de recorridos
* liquidaciones de cobradores
* configuración financiera del negocio

---

# Eventos Sprint

| Fecha | Evento               |
| ----- | -------------------- |
| 22/06 | Daily                |
| 24/06 | Daily                |
| 26/06 | Daily                |
| 29/06 | Daily                |
| 01/07 | Daily                |
| 02/07 | Pre-Demo QA          |
| 03/07 | Sprint Review + Demo |

---

# Entidades Sprint

* route_sheets
* route_sheet_items
* settlements
* financing_configurations

---

# Backend Tasks

## Route Sheets Module

* generación automática de hojas de ruta
* asignación de cobradores
* organización por zonas
* filtros por sociedad

---

## Route Sheet Items Module

* clientes asignados a recorrido
* cuotas pendientes asociadas
* visitas programadas
* estados de visita

---

## Settlements Module

* liquidación diaria cobrador
* validación administrativa
* conciliación de importes
* auditoría de cierres

---

## Financing Configuration Module

* financiación global
* financiación por producto
* interés configurable
* cantidad máxima de cuotas
* validaciones comerciales

---

# API Endpoints

## Route Sheets

### POST /route-sheets

### GET /route-sheets

### GET /route-sheets/:id

---

## Route Sheet Items

### GET /route-sheet-items

### PATCH /route-sheet-items/:id

---

## Settlements

### POST /settlements

### GET /settlements

### GET /settlements/:id

---

## Financing Configurations

### POST /financing-configurations

### GET /financing-configurations

### PATCH /financing-configurations/:id

---

# Frontend Tasks

## Route Sheets UI

* generación hoja de ruta
* visualización recorridos
* detalle hoja
* asignación cobrador

---

## Route Management UI

* clientes asignados
* cuotas asociadas
* estado de visitas
* seguimiento recorrido

---

## Settlements UI

* liquidación diaria
* resumen cobrador
* validación administración
* historial liquidaciones

---

## Financing UI

* configuración financiación
* simulador de cuotas
* reglas comerciales
* parámetros financieros

---

# QA

## Validaciones

* generación hoja ruta
* asignación cobrador
* cálculo liquidación
* conciliación importes
* configuración financiación
* simulación cuotas

---

# Riesgos

| Riesgo                       | Mitigación                      |
| ---------------------------- | ------------------------------- |
| cambios operativos           | revisión con cobradores         |
| errores liquidación          | doble validación administrativa |
| reglas financieras variables | parametrización completa        |

---

# Entregables

* hojas de ruta operativas
* recorridos asignados
* liquidaciones funcionales
* configuración financiera parametrizable

---

# Sprint Goal

Operación de cobranzas organizada y preparada para la gestión de pagos.
