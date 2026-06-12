# Sprint 02 — Development Plan

## Objetivo

Implementar la base operativa del flujo comercial de Canarias, permitiendo registrar una venta desde la carga inicial realizada por el vendedor hasta el cierre administrativo de la operación.

---

# Alcance del Sprint

Módulos incluidos:

* Auth
* Clients
* Sales
* Sale Validation
* Products
* Zones
* Staff
* Installments

---

# Flujo Funcional

SELLER

↓

Carga cliente + venta

↓

ADMIN

↓

Validación telefónica

↓

Coordinación visita ambiental

↓

COLLECTOR

↓

Visita ambiental

↓

ADMIN

↓

Aprobación/Rechazo

↓

Coordinación entrega

↓

COLLECTOR

↓

Entrega + firma contrato

↓

ADMIN

↓

Cierre administrativo

↓

Generación cuotas

---

# Entidades Involucradas

Existentes:

* clients
* sales
* staff
* societies
* clients_historial

Sprint 02:

* products
* zones
* staff_zones
* staff_societies
* sale_validations
* installments

---

# Backend Tasks

## Auth

* validar roles
* actualizar JWT para múltiples sociedades
* soportar activeSociety

---

## Clients

* alta cliente
* edición cliente
* búsqueda cliente
* validaciones

---

## Products

* entidad product
* CRUD básico
* seed inicial productos
* listado activo

---

## Zones

* CRUD zonas
* asociación con sociedad
* filtros

---

## Staff Zones

* asignar vendedor/cobrador a zona
* desasignación lógica
* consulta asignaciones

---

## Staff Societies

* asignar usuario a sociedad
* múltiples sociedades por usuario
* consulta alcance

---

## Sales

* creación venta
* relación cliente
* relación producto
* estados iniciales

---

## Sale Validation

* validación administrativa
* aprobación
* rechazo
* observaciones

---

## Installments

* entidad base
* relación venta/cuota
* estados iniciales

---

# Frontend Tasks

## Auth

* login
* manejo JWT
* selector sociedad

---

## Dashboard

* SUPER_ADMIN
* MANAGER
* ADMIN
* SELLER
* COLLECTOR

---

## Clients

* listado
* alta
* edición

---

## Products

* listado
* selección en venta

---

## Zones

* listado
* ABM

---

## Sales

Formulario único:

* datos cliente
* producto
* observaciones

---

## Sale Validation

* listado pendientes
* aprobación
* rechazo
* observaciones

---

# Integraciones

Frontend consumirá:

* Auth API
* Clients API
* Products API
* Zones API
* Staff API
* Sales API

---

# Definition of Done

Una historia se considera terminada cuando:

* funcionalidad implementada
* permisos validados
* validaciones completas
* documentación actualizada
* código revisado
* desplegado en ambiente de pruebas

---

# Estado

Documento vigente Sprint 02.
