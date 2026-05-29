# Canarias System — Frontend Tests

# Objetivo

Documentar la estrategia de testing frontend del sistema.

El frontend deberá priorizar testing sobre:

* formularios
* navegación crítica
* autenticación
* estados UI importantes
* permisos visuales

---

# Tecnologías

| Tecnología            | Uso               |
| --------------------- | ----------------- |
| Vitest o Jest         | Testing           |
| React Testing Library | Component testing |
| Cypress futuro        | E2E frontend      |

---

# Tipos Testing Frontend

| Tipo            | Objetivo             |
| --------------- | -------------------- |
| Component Tests | Componentes UI       |
| Page Tests      | Pantallas completas  |
| Flow Tests      | Navegación operativa |

---

# Prioridades Testing

---

# Prioridad Crítica

* login
* formularios ventas
* formularios cobranzas
* cierre diario
* validaciones

---

# Prioridad Alta

* dashboards
* tablas
* filtros
* navegación

---

# Prioridad Media

* componentes visuales
* responsive
* estilos

---

# Arquitectura Tests

---

# Estructura Recomendada

```text id="tst104"
src/
├── components
├── pages
├── tests
└── __tests__
```

---

# Naming Convention

| Tipo      | Ejemplo                  |
| --------- | ------------------------ |
| Component | login-form.test.tsx      |
| Page      | sales-page.test.tsx      |
| Flow      | collection-flow.test.tsx |

---

# Component Testing

---

# Objetivo

Validar comportamiento componentes.

---

# Casos Obligatorios

* renderizado correcto
* loading states
* error states
* validaciones formularios

---

# Ejemplo Casos

```text id="tst105"
✓ muestra errores validación
✓ deshabilita submit loading
✓ renderiza dashboard correctamente
```

---

# Formularios

Validar:

* required fields
* formatos
* submit
* errores backend
* estados loading

---

# Navegación

Validar:

* rutas protegidas
* redirects
* permisos
* layouts

---

# Auth Testing

Validar:

* login
* logout
* persistencia sesión
* expiración token

---

# Tables Testing

Validar:

* paginación
* filtros
* sorting
* loading
* empty states

---

# UI States

Todos los componentes deberán contemplar:

* loading
* empty
* error
* success

---

# Accesibilidad

Validar:

* labels
* keyboard navigation
* focus states futuros

---

# Mocking

Utilizar mocks para:

* API requests
* auth
* queries
* Zustand stores

---

# Performance

Futuro:

* render performance
* bundle testing
* lazy loading validation

---

# Cobertura Recomendada

| Área                 | Cobertura |
| -------------------- | --------- |
| Formularios críticos | 80%+      |
| UI reusable          | 60%+      |
| Pages                | 50%+      |

---

# Reglas Técnicas

---

# NO Testear

* librerías externas
* Tailwind internals
* Shadcn internals

---

# SI Testear

* comportamiento usuario
* validaciones
* permisos visuales
* navegación

---

# Escalabilidad Futura

Preparado para:

* visual regression testing
* realtime testing
* mobile testing
* offline testing

---

# Estado Actual

Frontend testing aprobado para Fase 1.
