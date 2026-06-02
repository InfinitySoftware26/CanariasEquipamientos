# Canarias System — System Overview

# Objetivo del Documento

Este documento describe la arquitectura general del sistema Canarias System, incluyendo:

* visión técnica
* componentes principales
* stack tecnológico
* arquitectura general
* principios de diseño
* estructura modular
* consideraciones de escalabilidad

---

# Visión General

Canarias System es una plataforma web modular diseñada para gestionar la operatoria financiera, comercial y logística de Canarias y sus distintas sociedades.

El sistema permitirá centralizar:

* ventas financiadas
* cobranzas
* hojas de ruta
* stock
* clientes
* cajas
* reportes financieros

La arquitectura fue diseñada priorizando:

* escalabilidad
* mantenibilidad
* modularidad
* seguridad
* trazabilidad

---

# Arquitectura General

```text
Frontend (React)
        ↓
REST API (NestJS)
        ↓
Business Logic Layer
        ↓
Database Layer (TypeORM)
        ↓
PostgreSQL
```

---

# Arquitectura de Alto Nivel

```text
┌──────────────────────┐
│      Frontend        │
│ React + TypeScript   │
└──────────┬───────────┘
           │
           │ HTTPS / REST API
           │
┌──────────▼───────────┐
│       Backend        │
│ NestJS + TypeORM     │
└──────────┬───────────┘
           │
           │ ORM
           │
┌──────────▼───────────┐
│     PostgreSQL       │
└──────────────────────┘
```

---

# Estilo Arquitectónico

Canarias System seguirá una arquitectura:

```text
Modular Monolith
```

La aplicación estará compuesta por módulos desacoplados dentro de una única aplicación backend.

---

# Motivos de la Decisión Arquitectónica

La elección de un monolito modular permite:

* reducir complejidad inicial
* acelerar desarrollo
* simplificar despliegues
* facilitar transacciones financieras
* mantener lógica centralizada
* reducir costos operativos
* mejorar mantenibilidad
* facilitar onboarding técnico

---

# Características de la Arquitectura

Cada módulo será independiente a nivel lógico:

* controllers
* services
* repositories
* entities
* DTOs
* reglas de negocio

Sin embargo, todos los módulos compartirán:

* misma aplicación NestJS
* misma base de datos
* mismo ciclo de despliegue
* mismo entorno operativo

---

# Evolución Futura de Arquitectura

Aunque inicialmente el sistema será implementado como un Modular Monolith, la arquitectura fue diseñada para permitir una futura migración progresiva hacia microservicios.

La modularización actual permitirá desacoplar dominios funcionales en el futuro sin necesidad de reescribir completamente la plataforma.

---
# Consideración de Escalabilidad Futura

Actualmente la autenticación y operación del sistema se basa exclusivamente en usuarios internos representados mediante la entidad:

```text
STAFF
```

La entidad STAFF representa:

* administradores
* cobradores
* vendedores
* gerentes
* operadores internos

---

# Escalabilidad Futura

La arquitectura contempla futura expansión hacia:

* aplicaciones móviles
* portales clientes
* acceso proveedores
* autoservicio usuarios

En futuras etapas podrán incorporarse entidades independientes como:

```text
ACCOUNTS
CUSTOMERS
APP_USERS
```

sin afectar la estructura interna operativa del sistema.

---

# Posibles Microservicios Futuros

Dominios candidatos a separación futura:

* auth-service
* collections-service
* notifications-service
* reports-service
* stock-service
* integrations-service

---

# Estrategia de Escalabilidad

La evolución hacia microservicios dependerá de:

* crecimiento operativo
* carga del sistema
* volumen transaccional
* necesidad de escalado independiente
* nuevas integraciones
* expansión multiempresa

---

# Principios Arquitectónicos

---

# Modularidad

El sistema estará dividido en módulos independientes:

* auth
* users
* clients
* sales
* collections
* routes
* products
* stock
* reports

---

# Bajo Acoplamiento

Los módulos deberán interactuar minimizando dependencias directas.

---

# Alta Cohesión

Cada módulo deberá encapsular su propia lógica de negocio.

---

# Escalabilidad

La arquitectura deberá permitir:

* nuevos módulos
* nuevas sociedades
* nuevos dashboards
* futuras integraciones
* crecimiento operativo

---

# Multi-Sociedad

El sistema implementará segmentación lógica por sociedad.

Cada entidad operativa deberá asociarse a:

```text
society_id
```

---

# Seguridad

La arquitectura prioriza:

* JWT authentication
* autorización por roles
* segmentación por sociedad
* auditoría
* validaciones backend

---

# Trazabilidad

Toda operación crítica deberá registrar:

* usuario
* fecha
* acción
* cambios realizados

---

# Arquitectura Backend

El backend seguirá arquitectura modular basada en NestJS.

Cada módulo contendrá:

```text
controller
service
dto
entity
repository
guards
interfaces
```

---

# Arquitectura Frontend

El frontend seguirá arquitectura basada en módulos funcionales.

Separación principal:

```text
modules/
components/
layouts/
services/
store/
types/
routes/
```

---

# Stack Tecnológico

# Frontend

| Tecnología       | Uso                                          |
| ---------------- | -------------------------------------------- |
| Next.js          | Framework React con App Router y SSR         |
| React            | UI                                           |
| TypeScript       | Tipado                                      |
| TailwindCSS      | Estilos                                     |
| Zustand          | Estado global                               |
| React Query      | Manejo APIs                                 |

---

# Backend

| Tecnología      | Uso                |
| --------------- | ------------------ |
| Node.js         | Runtime backend    |
| pnpm            | Gestor de paquetes |
| NestJS          | Framework backend  |
| TypeScript      | Tipado             |
| TypeORM         | ORM                |
| PostgreSQL      | Base de datos      |
| JWT             | Autenticación      |
| Swagger         | Documentación APIs |
| Class Validator | Validaciones       |

---

# Infraestructura

| Tecnología     | Uso           |
| -------------- | ------------- |
| Docker         | Contenedores  |
| Docker Compose | Orquestación  |
| Nginx          | Reverse proxy |
| VPS Linux      | Hosting       |
| GitHub         | Repositorio   |

---

# Flujo Operativo General

```text
Venta
   ↓
Aprobación
   ↓
Entrega
   ↓
Cobranza
   ↓
Cierre Diario
   ↓
Rendición
```

---

# Roles del Sistema

| Rol       | Descripción              |
| --------- | ------------------------ |
| ADMIN     | Administración operativa |
| SELLER    | Ventas                   |
| COLLECTOR | Cobranza                 |
| MANAGER   | Supervisión financiera   |

---

# Consideraciones Técnicas

* Toda validación crítica ocurre en backend.
* El frontend actúa como cliente desacoplado.
* La lógica financiera estará centralizada.
* El sistema será API-first.
* La modularización será obligatoria.
* La arquitectura deberá soportar futura distribución de servicios.

---

# Estrategia de Desarrollo

El proyecto se desarrollará mediante:

* fases iterativas
* micro-sprints
* demos quincenales
* documentación continua

---

# Objetivos Técnicos Iniciales

# Fase 1

* autenticación
* roles
* estructura modular
* layout base
* multi-sociedad

---

# Evolución Futura

La arquitectura permitirá incorporar:

* aplicación mobile
* geolocalización
* WhatsApp
* notificaciones push
* BI dashboards
* integraciones contables
* colas de procesamiento
* microservicios
* event-driven architecture

---

# Estado Actual

Fase inicial de construcción arquitectónica y setup base del sistema.
