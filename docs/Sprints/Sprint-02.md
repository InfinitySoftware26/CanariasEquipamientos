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

* clientes
* productos
* financiación
* ventas
* cuotas

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

* customer
* customer_address
* product
* category
* financing_configuration
* sale
* installment

---

# Backend Tasks

## Customers Module

* CRUD clientes
* validaciones DNI
* validaciones teléfono
* direcciones cliente
* búsqueda avanzada

---

## Products Module

* CRUD productos
* categorías
* precios
* configuración stock

---

## Financing Module

* financiación global
* financiación individual producto
* cálculo cuotas
* interés configurable

---

## Sales Module

* alta venta
* generación automática cuotas
* estados venta
* validaciones negocio

---

# API Endpoints

## Customers

### POST /customers

### GET /customers

### GET /customers/:id

### PATCH /customers/:id

---

## Products

### POST /products

### GET /products

---

## Sales

### POST /sales

### GET /sales

### GET /sales/:id

---

# Frontend Tasks

## Customers UI

* alta cliente
* edición cliente
* ficha cliente
* tabla clientes

---

## Products UI

* alta producto
* listado productos
* categorías

---

## Sales UI

* formulario venta
* cálculo cuotas realtime
* resumen venta
* validaciones visuales

---

# QA

## Validaciones

* alta cliente
* cálculo financiación
* generación cuotas
* reglas negocio

---

# Riesgos

| Riesgo             | Mitigación       |
| ------------------ | ---------------- |
| complejidad cuotas | testing temprano |
| cambios negocio    | demo continua    |

---

# Entregables

* flujo venta funcional
* clientes operativos
* cuotas automáticas
* financiación configurable

---

# Sprint Goal

Flujo comercial completamente funcional.
