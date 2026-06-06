# Canarias System — Database Architecture

# Objetivo del Documento

Definir la arquitectura de base de datos del sistema Canarias System, incluyendo:

* estrategia relacional
* diseño general
* convenciones
* integridad
* escalabilidad
* auditoría
* multi-sociedad

---

# Motor de Base de Datos

El sistema utilizará:

```text id="d2s9mv"
PostgreSQL
```

como motor principal de persistencia.

---

# ORM

La capa de acceso a datos será implementada mediante:

```text id="x7g5pw"
TypeORM
```

integrado con NestJS.

---

# Estrategia Arquitectónica

Inicialmente el sistema seguirá una arquitectura:

```text id="u4n7ba"
Single Database Architecture
```

donde todos los módulos compartirán una única base de datos relacional.

---

# Motivos de la Decisión

La estrategia centralizada permite:

* simplificar desarrollo
* facilitar transacciones
* mantener consistencia
* reducir complejidad
* acelerar implementación

---

# Evolución Futura

La arquitectura permitirá evolucionar hacia:

* read replicas
* analytics databases
* separación por servicios
* database per service
* sharding

si el crecimiento operativo lo requiere.

---

# Arquitectura Relacional

La base de datos seguirá un modelo relacional normalizado.

Principales dominios:

* usuarios
* sociedades
* clientes
* ventas
* cuotas
* cobranzas
* hojas de ruta
* stock
* cajas
* proveedores

---

# Principios de Diseño

---

# Integridad Referencial

Toda relación deberá implementarse mediante:

* foreign keys
* constraints
* validaciones

---

# Trazabilidad

Toda operación crítica deberá ser auditable.

---

# Soft Delete

Las entidades críticas utilizarán:

```text id="u9r2mk"
deleted_at
```

para evitar eliminación física.

---

# UUIDs

Todas las entidades utilizarán:

```text id="m6v8sp"
UUID
```

como identificador principal.

---

# Convenciones

---

# Tablas

Formato:

```text id="y7q4xa"
snake_case
```

Ejemplos:

```text id="s5w2cr"
sales
clients
cash_movements
route_assignments
```

---

# Campos

Formato:

```text id="m2x8tv"
snake_case
```

Ejemplos:

```text id="g8u5pd"
created_at
updated_at
society_id
```

---

# Auditoría Base

Las entidades críticas deberán contener:

```text id="x5r9eb"
created_at
updated_at
deleted_at
created_by
updated_by
```

---

# Multi-Sociedad

Toda entidad operativa deberá incluir:

```text id="q3t7yx"
society_id
```

La segmentación será obligatoria.

- Los datos deberán consultarse siempre con `society_id`.
- Los reportes y operaciones se aislarán por sociedad.
- El backend será responsable de validar la sociedad activa.

---

# Estrategia de Relaciones

---

# One To Many

Ejemplos:

* sociedad → usuarios
* cliente → ventas
* venta → cuotas

---

# Many To One

Ejemplos:

* cuota → venta
* cobranza → cobrador
* producto → proveedor

---

# Many To Many

Utilizar únicamente cuando sea estrictamente necesario.

Preferir tablas intermedias explícitas.

---

# Transacciones

Operaciones críticas deberán ejecutarse mediante transacciones.

Ejemplos:

* cobranzas
* cierres diarios
* movimientos caja
* refinanciaciones

---

# Estrategia de Índices

Se deberán crear índices sobre:

* foreign keys
* búsquedas frecuentes
* fechas operativas
* estados
* society_id

---

# Índices Críticos

Ejemplos:

```text id="k8z4pj"
client_id
sale_id
collector_id
society_id
status
created_at
```

---

# Consistencia Financiera

Las operaciones financieras deberán garantizar:

* atomicidad
* consistencia
* integridad
* rollback automático

---

# Auditoría

Toda operación crítica deberá registrar:

* usuario
* fecha
* entidad
* acción
* cambios

---

# Migrations

La estructura deberá administrarse mediante:

```text id="a8p5wy"
TypeORM Migrations
```

---

# Seeders

El sistema deberá incluir seeders iniciales para:

* roles
* sociedades
* permisos
* usuarios admin

---

# Estrategia de Escalabilidad

La arquitectura permitirá:

* futuras bases distribuidas
* event sourcing parcial
* CQRS futuro
* analytics independientes

---

# Backups

La base de datos deberá poseer:

* backups automáticos
* backups diarios
* recuperación rápida
* estrategia disaster recovery

---

# Consideraciones Técnicas

* PostgreSQL como única fuente verdad
* reglas críticas backend-only
* transacciones obligatorias
* segmentación multi-sociedad
* consistencia financiera prioritaria

---

# Estado Actual

Fase inicial de modelado y construcción relacional.
