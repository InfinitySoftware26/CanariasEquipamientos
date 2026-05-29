# Canarias System — Sprint Planning

# Objetivo

Definir la planificación operativa y técnica del desarrollo del sistema Canarias.

La planificación busca garantizar:

* entregas incrementales
* validación continua
* organización técnica
* escalabilidad futura
* comunicación clara entre áreas

---

# Duración Proyecto

| Concepto             | Valor                       |
| -------------------- | --------------------------- |
| Duración total       | 12 semanas                  |
| Metodología          | Scrum híbrido               |
| Sprint duration      | 14 días                     |
| Daily técnica        | Lunes / Miércoles / Viernes |
| Pre-Demo QA          | Jueves semana 2             |
| Sprint Review + Demo | Viernes semana 2            |

---

# Filosofía Desarrollo

El proyecto priorizará:

```text id="spl201"
operatividad real + escalabilidad futura
```

---

# Objetivo Principal

Construir un sistema:

* estable
* mantenible
* modular
* preparado para crecimiento futuro

---

# Estrategia Técnica

## Arquitectura

* Monolito Modular
* Domain Driven Organization
* Backend desacoplado
* Frontend componentizado
* Preparado para microservicios futuros

---

# Stack Principal

| Área             | Tecnología        |
| ---------------- | ----------------- |
| Backend          | NestJS            |
| ORM              | TypeORM           |
| Database         | PostgreSQL        |
| Frontend         | React             |
| State Management | Zustand           |
| UI               | Tailwind + Shadcn |
| Auth             | JWT               |

---

# Organización Equipo

| Rol          | Responsabilidad             |
| ------------ | --------------------------- |
| Tech Lead    | Arquitectura + coordinación |
| Backend Dev  | APIs + negocio              |
| Frontend Dev | UI + integración            |
| QA Manual    | Validación workflows        |
| Cliente      | Feedback operativo          |

---

# Dinámica Operativa

---

# Daily Técnica

## Frecuencia

* lunes
* miércoles
* viernes

---

# Objetivo

* revisar avances
* resolver bloqueos
* validar prioridades
* sincronizar equipo

---

# Duración Máxima

```text id="spl202"
15 a 30 minutos
```

---

# Pre-Demo QA

## Frecuencia

Jueves de la segunda semana del sprint.

---

# Objetivo

* validar workflows
* detectar errores críticos
* preparar demo cliente

---

# Sprint Review + Demo

## Frecuencia

Viernes de la segunda semana del sprint.

---

# Objetivo

* mostrar avances reales
* validar negocio
* recibir feedback temprano

---

# Estructura Sprint

Cada sprint deberá incluir:

---

# Backend

* módulos
* entidades
* endpoints
* DTOs
* reglas negocio
* tests críticos

---

# Frontend

* pantallas
* componentes
* formularios
* integración API
* validaciones UI

---

# QA

* acceptance testing
* workflows críticos
* validaciones operativas

---

# Definition of Done

Una tarea se considera terminada cuando:

* funcionalidad completa
* integrada
* validada
* testeada
* documentada

---

# Roadmap General

---

# Sprint 1 — Fundaciones

## Duración

29/05 → 06/06

---

# Objetivo

Construcción base arquitectura y autenticación.

---

# Daily Planning

| Fecha           | Evento               |
| --------------- | -------------------- |
| Jueves 29/05    | Daily 1              |
| Lunes 02/06     | Daily 2              |
| Miércoles 04/06 | Daily 3              |
| Jueves 05/06    | Pre-Demo QA          |
| Viernes 06/06   | Sprint Review + Demo |

---

# Backend

* setup NestJS
* auth JWT
* roles
* sociedades
* configuración inicial
* arquitectura modular
* TypeORM setup

---

# Frontend

* login
* layouts
* routing
* auth guards
* dashboard base

---

# QA

* login validation
* auth testing
* roles validation

---

# Entregable

Sistema autenticado operativo.

---

# Sprint 2 — Ventas y Clientes

## Duración

09/06 → 20/06

---

# Objetivo

Construir flujo comercial inicial.

---

# Daily Planning

| Fecha           | Evento               |
| --------------- | -------------------- |
| Lunes 09/06     | Daily                |
| Miércoles 11/06 | Daily                |
| Viernes 13/06   | Daily                |
| Lunes 16/06     | Daily                |
| Miércoles 18/06 | Daily                |
| Jueves 19/06    | Pre-Demo QA          |
| Viernes 20/06   | Sprint Review + Demo |

---

# Backend

* customers module
* products module
* financing configuration
* sales entities
* installments generation
* validations

---

# Frontend

* alta cliente
* formulario ventas
* productos
* financiación UI
* dashboards seller

---

# QA

* alta cliente
* alta venta
* validación financiación

---

# Entregable

Flujo básico ventas operativo.

---

# Sprint 3 — Cobranzas

## Duración

23/06 → 04/07

---

# Objetivo

Construcción flujo cobranzas y pagos.

---

# Daily Planning

| Fecha           | Evento               |
| --------------- | -------------------- |
| Lunes 23/06     | Daily                |
| Miércoles 25/06 | Daily                |
| Viernes 27/06   | Daily                |
| Lunes 30/06     | Daily                |
| Miércoles 02/07 | Daily                |
| Jueves 03/07    | Pre-Demo QA          |
| Viernes 04/07   | Sprint Review + Demo |

---

# Backend

* collections module
* payments
* receipts
* overdue logic
* failed visits

---

# Frontend

* pantalla cobranzas
* historial pagos
* recibos
* alertas mora

---

# QA

* flujo cobranza
* cuotas parciales
* recibos

---

# Entregable

Sistema cobranzas operativo.

---

# Sprint 4 — Operación Diaria

## Duración

07/07 → 18/07

---

# Objetivo

Automatizar operación cobradores.

---

# Daily Planning

| Fecha           | Evento               |
| --------------- | -------------------- |
| Lunes 07/07     | Daily                |
| Miércoles 09/07 | Daily                |
| Viernes 11/07   | Daily                |
| Lunes 14/07     | Daily                |
| Miércoles 16/07 | Daily                |
| Jueves 17/07    | Pre-Demo QA          |
| Viernes 18/07   | Sprint Review + Demo |

---

# Backend

* route sheets
* deliveries
* daily closures
* route assignments
* cash movements

---

# Frontend

* dashboard cobrador
* hojas ruta
* entregas
* cierre diario

---

# QA

* cierre jornada
* generación rutas
* entregas

---

# Entregable

Operación diaria automatizada.

---

# Sprint 5 — Stock, Finanzas y Reportes

## Duración

21/07 → 01/08

---

# Objetivo

Consolidar inventario, finanzas y métricas.

---

# Daily Planning

| Fecha           | Evento               |
| --------------- | -------------------- |
| Lunes 21/07     | Daily                |
| Miércoles 23/07 | Daily                |
| Viernes 25/07   | Daily                |
| Lunes 28/07     | Daily                |
| Miércoles 30/07 | Daily                |
| Jueves 31/07    | Pre-Demo QA          |
| Viernes 01/08   | Sprint Review + Demo |

---

# Backend

* stock
* suppliers
* supplier payments
* cash balances
* reports
* notifications

---

# Frontend

* stock dashboard
* proveedores
* cajas
* reportes manager

---

# QA

* stock movements
* balances
* métricas

---

# Entregable

Sistema financiero consolidado.

---

# Sprint 6 — QA Final y Release

## Duración

04/08 → 15/08

---

# Objetivo

Estabilización final y preparación producción.

---

# Daily Planning

| Fecha           | Evento                     |
| --------------- | -------------------------- |
| Lunes 04/08     | Daily                      |
| Miércoles 06/08 | Daily                      |
| Viernes 08/08   | Daily                      |
| Lunes 11/08     | Daily                      |
| Miércoles 13/08 | Daily                      |
| Jueves 14/08    | Pre-Demo QA                |
| Viernes 15/08   | Sprint Review + Demo Final |

---

# Backend

* optimización queries
* seguridad
* testing final
* fixes críticos
* deploy preparation

---

# Frontend

* responsive fixes
* UX polish
* performance
* final validations

---

# QA

* acceptance testing
* regression testing
* stress testing básico

---

# Entregable

Sistema listo para producción.

---

# Prioridades Absolutas

## Crítico

* auth
* ventas
* cobranzas
* cierres

---

# Alto

* stock
* finanzas
* reportes

---

# Medio

* UX avanzada
* optimizaciones
* automatizaciones futuras

---

# Riesgos Identificados

| Riesgo                   | Mitigación            |
| ------------------------ | --------------------- |
| Backend bloquea frontend | contratos API primero |
| Cambios negocio          | demos frecuentes      |
| Complejidad workflows    | documentación fuerte  |
| Tiempo limitado          | priorizar MVP         |

---

# Estrategia Releases

Cada sprint deberá entregar:

* funcionalidades reales
* workflows completos
* incrementos operativos

---

# Objetivo Final

Entregar un sistema:

* operativo
* estable
* mantenible
* escalable
* preparado para crecimiento futuro

---

# Estado Actual

Sprint planning aprobado para inicio desarrollo.
