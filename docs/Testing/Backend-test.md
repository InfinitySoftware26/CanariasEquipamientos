# Canarias System — Backend Tests

# Objetivo

Documentar la estrategia de testing backend del sistema.

El backend deberá priorizar testing sobre:

* lógica negocio
* seguridad
* autenticación
* workflows críticos
* cálculos financieros

---

# Tecnologías

| Tecnología            | Uso                 |
| --------------------- | ------------------- |
| Jest                  | Unit Testing        |
| Supertest             | HTTP Testing        |
| NestJS Testing Module | Integration Testing |

---

# Tipos Testing Backend

| Tipo              | Objetivo           |
| ----------------- | ------------------ |
| Unit Tests        | Servicios aislados |
| Integration Tests | Módulos integrados |
| API Tests         | Endpoints HTTP     |

---

# Prioridades Testing

---

# Prioridad Crítica

* auth
* permisos
* cobranzas
* cuotas
* cierres
* caja
* stock

---

# Prioridad Alta

* ventas
* entregas
* hojas ruta
* financiación

---

# Prioridad Media

* reportes
* dashboards
* filtros

---

# Arquitectura Tests

---

# Estructura Recomendada

```text id="tst102"
src/
├── modules
│   ├── sales
│   │   ├── tests
│   │   ├── sales.service.spec.ts
│   │   └── sales.controller.spec.ts
```

---

# Naming Convention

| Tipo       | Ejemplo                  |
| ---------- | ------------------------ |
| Service    | sales.service.spec.ts    |
| Controller | sales.controller.spec.ts |
| E2E        | sales.e2e-spec.ts        |

---

# Unit Testing

---

# Objetivo

Validar lógica aislada.

---

# Casos Obligatorios

* cálculos cuotas
* generación financiamiento
* validaciones negocio
* reglas permisos
* generación hojas ruta

---

# Ejemplo Casos

```text id="tst103"
✓ genera cuotas correctamente
✓ calcula mora
✓ valida permisos admin
✓ rechaza venta inválida
```

---

# Integration Testing

---

# Objetivo

Validar interacción módulos.

---

# Casos Obligatorios

* venta + cuotas
* cobranza + caja
* cierre + movimientos
* entrega + stock

---

# API Testing

---

# Objetivo

Validar endpoints HTTP.

---

# Validaciones

* status codes
* responses
* auth
* DTO validation
* error handling

---

# Casos Obligatorios

| Endpoint          | Validación      |
| ----------------- | --------------- |
| POST /auth/login  | login correcto  |
| POST /sales       | venta válida    |
| POST /collections | pago correcto   |
| POST /closures    | cierre correcto |

---

# Error Testing

Validar:

* unauthorized
* forbidden
* bad request
* not found
* internal error

---

# Seguridad

Todo endpoint deberá validar:

* JWT
* roles
* permisos
* sociedad activa

---

# Database Testing

Validar:

* relaciones
* integridad
* transacciones
* soft deletes futuros

---

# Mocking

Utilizar mocks para:

* servicios externos
* repositories
* autenticación
* cache futuro

---

# Performance

Futuro:

* stress tests
* load tests
* concurrency tests

---

# Cobertura Recomendada

| Área          | Cobertura |
| ------------- | --------- |
| Core Business | 80%+      |
| Controllers   | 60%+      |
| Utils         | 90%+      |

---

# Reglas Técnicas

---

# NO Testear

* TypeORM internals
* librerías externas
* NestJS interno

---

# SI Testear

* reglas negocio
* cálculos
* permisos
* estados workflows

---

# Escalabilidad Futura

Preparado para:

* microservices testing
* contract testing
* queue testing
* websocket testing

---

# Estado Actual

Backend testing aprobado para Fase 1.
