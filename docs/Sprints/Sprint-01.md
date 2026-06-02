# Canarias System — Sprint 01

# Fecha Sprint Review

05/06/2026

---

# Duración Sprint

25/05/2026 → 05/06/2026

---

# Objetivo General

Construir las fundaciones técnicas del sistema.

Este sprint tiene como objetivo dejar operativa la base completa del proyecto:

* arquitectura backend
* arquitectura frontend
* autenticación
* roles
* estructura modular
* configuración inicial
* base de datos inicial
* layouts principales
* documentación inicial

---

# Eventos Sprint

| Fecha | Evento               |
| ----- | -------------------- |
| 29/05 | Daily 1              |
| 01/06 | Daily 2              |
| 03/06 | Daily 3              |
| 04/06 | Pre-Demo QA          |
| 05/06 | Sprint Review + Demo |

---

# Objetivos Técnicos

## Backend

* Inicializar NestJS
* Configurar TypeORM
* Configurar PostgreSQL
* Configurar arquitectura modular
* Configurar JWT
* Configurar Guards
* Configurar Roles
* Configurar Exception Filter
* Configurar Validation Pipe
* Configurar estructura módulos

---

## Frontend

* Inicializar React con Next.js
* Configurar Next.js App Router
* Configurar Tailwind
* Configurar Shadcn
* Configurar Zustand
* Definir rutas mediante `src/app/`
* Crear layout principal
* Crear login
* Crear protected routes
* Crear dashboard base

---

# Entidades Sprint

* staff
* role
* permission
* society
* configuration

---

# Backend Tasks

## Arquitectura

* estructura modular
* módulos desacoplados
* configuración aliases
* configuración environment

---

## Seguridad

* JWT strategy
* login endpoint
* guards
* decorators permisos

---

## Database

* conexión PostgreSQL
* entidades iniciales
* migraciones iniciales
* seeders roles

---

# API Endpoints

## Auth

### POST /auth/login

```json
{
  "email": "admin@canarias.com",
  "password": "******"
}
```

---

### GET /auth/profile

Retorna usuario autenticado.

---

## Staff

### CRUD básico

* alta empleado
* edición empleado
* asignación roles

---

# Frontend Tasks

## Auth

* login page
* form validations
* auth store
* persistencia sesión

---

## Layout

* sidebar
* navbar
* protected layout
* responsive base

---

## Dashboard

* dashboard admin inicial
* dashboard collector placeholder
* dashboard seller placeholder
* dashboard manager placeholder

---

# QA

## Validaciones

* login correcto
* JWT válido
* permisos
* navegación protegida
* errores auth

---

# Riesgos

| Riesgo                 | Mitigación     |
| ---------------------- | -------------- |
| retrasos setup         | priorizar auth |
| problemas arquitectura | daily técnica  |

---

# Entregables

* autenticación funcional
* estructura proyecto definida
* arquitectura aprobada
* layouts funcionando

---

# Sprint Goal

Sistema autenticado y arquitectura estable.
