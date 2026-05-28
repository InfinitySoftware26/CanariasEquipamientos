# Canarias System — Backend Architecture

# Objetivo del Documento

Definir la arquitectura backend del sistema Canarias System, incluyendo:

* estructura del proyecto
* modularización
* capas
* patrones
* seguridad
* validaciones
* convenciones técnicas
* escalabilidad futura

---

# Visión Arquitectónica

El backend será construido utilizando una arquitectura:

```text id="qz1x7f"
Modular Monolith
```

basada en NestJS.

La aplicación estará compuesta por módulos desacoplados que encapsulan dominios funcionales independientes dentro de una única aplicación backend.

La arquitectura fue diseñada para permitir una futura evolución progresiva hacia microservicios sin necesidad de reescribir completamente el sistema.

---

# Objetivos Arquitectónicos

La arquitectura backend prioriza:

* mantenibilidad
* modularidad
* bajo acoplamiento
* alta cohesión
* escalabilidad
* trazabilidad
* seguridad
* simplicidad operativa

---

# Stack Tecnológico

| Tecnología      | Uso                |
| --------------- | ------------------ |
| NestJS          | Framework backend  |
| TypeScript      | Lenguaje principal |
| PostgreSQL      | Base de datos      |
| TypeORM         | ORM                |
| JWT             | Autenticación      |
| Swagger         | Documentación APIs |
| Docker          | Contenedores       |
| bcrypt          | Hash passwords     |
| class-validator | Validaciones       |

---

# Arquitectura General

```text id="y4h8zn"
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

---

# Arquitectura Modular

La aplicación estará dividida en módulos independientes organizados por dominio funcional.

---

# Estructura General

```text id="m6q9tp"
src/
│
├── modules/
├── common/
├── config/
├── database/
├── shared/
├── infrastructure/
└── main.ts
```

---

# Módulos Iniciales

```text id="s4m2xw"
modules/
│
├── auth/
├── users/
├── societies/
├── clients/
├── sales/
├── collections/
├── routes/
├── products/
├── stock/
├── cash/
├── reports/
└── notifications/
```

---

# Estrategia de Modularización

Cada módulo deberá encapsular:

* lógica negocio
* entidades
* validaciones
* endpoints
* persistencia
* reglas operativas

Los módulos deberán minimizar dependencias directas entre sí.

---

# Estructura Interna de Módulos

```text id="r2u8ka"
module-name/
│
├── controllers/
├── services/
├── repositories/
├── entities/
├── dto/
├── guards/
├── interfaces/
├── enums/
├── validators/
├── events/
├── listeners/
└── module.ts
```

---

# Separación de Responsabilidades

---

# Controllers

Responsables de:

* recibir requests
* validar entrada
* responder requests
* delegar lógica

No deben contener lógica de negocio.

---

# Services

Responsables de:

* reglas negocio
* validaciones funcionales
* coordinación operativa
* cálculos financieros
* procesos transaccionales

---

# Repositories

Responsables de:

* acceso datos
* queries complejas
* persistencia
* optimización consultas

---

# DTOs

Responsables de:

* validación
* contratos API
* tipado
* sanitización datos

---

# Entities

Representan tablas mediante TypeORM.

---

# Arquitectura Preparada para Escalabilidad

La arquitectura modular permitirá futura extracción de módulos hacia microservicios independientes.

---

# Posibles Servicios Futuros

Módulos con potencial separación:

```text id="tb8d3s"
auth-service
collections-service
notifications-service
reports-service
stock-service
integrations-service
```

---

# Estrategia Evolutiva

La migración futura podrá realizarse mediante:

* event-driven architecture
* queues
* async communication
* internal APIs

sin afectar la lógica núcleo del sistema.

---

# Base de Datos

# Motor

```text id="l8z9va"
PostgreSQL
```

---

# ORM

```text id="q5y4cw"
TypeORM
```

---

# Estrategia Base Datos

Inicialmente:

```text id="z7t2eg"
Single Database Architecture
```

Futuras etapas podrán incorporar:

* read replicas
* separación analytics
* database sharding
* databases per service

---

# Convenciones

---

# Tablas

```text id="x8g5js"
snake_case
```

Ejemplo:

```text id="d3f8na"
sales
cash_movements
route_assignments
```

---

# Campos

```text id="g5w8tm"
snake_case
```

Ejemplo:

```text id="t7y2sv"
created_at
updated_at
society_id
```

---

# Código TypeScript

```text id="a4v9qh"
camelCase
```

Ejemplo:

```ts id="j9p4kr"
createdAt
updatedAt
societyId
```

---

# IDs

Todas las entidades utilizarán:

```text id="o2r5zw"
UUID
```

---

# Auditoría

Las entidades críticas deberán contener:

```text id="n6x4eu"
created_at
updated_at
deleted_at
created_by
updated_by
```

---

# Soft Delete

Las eliminaciones deberán implementarse mediante:

```text id="n8g2ha"
deleted_at
```

No se permitirán deletes físicos en entidades críticas.

---

# Seguridad

---

# Autenticación

El sistema utilizará:

```text id="w9t7ce"
JWT Authentication
```

---

# Autorización

Basada en:

* roles
* guards
* permisos
* segmentación sociedad

---

# Roles Iniciales

```text id="q2m5xy"
ADMIN
SELLER
COLLECTOR
MANAGER
```

---

# Password Hashing

Passwords almacenadas mediante:

```text id="o6x2wt"
bcrypt
```

---

# Seguridad Operativa

El backend deberá validar:

* permisos
* ownership
* society isolation
* integridad financiera
* reglas negocio

---

# Multi-Sociedad

Todas las entidades operativas deberán incluir:

```text id="v4f8rc"
society_id
```

La segmentación deberá realizarse exclusivamente en backend.

---

# Validaciones

Validaciones obligatorias:

* DTO validation
* business rules
* entity integrity
* financial consistency
* permissions

---

# Manejo de Errores

El sistema centralizará errores mediante:

* Exception Filters
* HTTP Exceptions
* Custom Exceptions

---

# Respuesta Standard API

Formato obligatorio:

```json id="z8h5tf"
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

# Logging

El sistema deberá registrar:

* errores
* accesos
* acciones críticas
* operaciones financieras
* auditoría usuarios

---

# Transacciones

Operaciones críticas deberán utilizar transacciones.

Ejemplos:

* cobranzas
* cierres diarios
* movimientos caja
* refinanciaciones
* aprobaciones ventas

---

# Configuración

Variables sensibles mediante:

```text id="f2v9ps"
.env
```

---

# Variables Iniciales

```env id="e4w6dn"
PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_EXPIRES=
```

---

# Swagger

Toda API deberá documentarse mediante:

```text id="g9k4ry"
Swagger OpenAPI
```

---

# Event-Driven Future

La arquitectura permitirá incorporar:

* domain events
* queues
* async processing
* background jobs

Ejemplos futuros:

* envío notificaciones
* generación reportes
* auditorías
* integraciones externas

---

# Integraciones Futuras

La arquitectura deberá soportar:

* WhatsApp API
* email providers
* payment gateways
* geolocation services
* accounting systems

---

# Consideraciones Técnicas

* Backend API-first
* Frontend desacoplado
* lógica financiera centralizada
* validaciones críticas backend-only
* módulos independientes
* arquitectura preparada para distribución futura

---

# Estrategia de Desarrollo

El backend se desarrollará mediante:

* módulos iterativos
* sprints funcionales
* documentación continua
* code reviews
* validación temprana

---

# Estado Actual

Fase inicial de construcción arquitectónica backend.
