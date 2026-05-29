# Canarias System — State Management

# Objetivo

Documentar la estrategia de manejo de estado frontend.

El sistema deberá separar correctamente:

* UI State
* Server State
* Auth State
* Form State
* Global State

---

# Tecnologías

| Tecnología      | Uso           |
| --------------- | ------------- |
| Zustand         | Estado global |
| React Query     | Server State  |
| React Hook Form | Formularios   |
| Zod             | Validaciones  |

---

# Arquitectura Estado

---

# Global State

Gestionado mediante:

```text id="jlwm57"
Zustand
```

---

# Casos Uso

* usuario autenticado
* sociedad activa
* sidebar state
* preferencias UI
* permisos

---

# Ejemplo Stores

```text id="jlwm58"
/stores
├── auth.store.ts
├── ui.store.ts
├── society.store.ts
└── permissions.store.ts
```

---

# Server State

Gestionado mediante:

```text id="jlwm59"
React Query
```

---

# Casos Uso

* clientes
* ventas
* cuotas
* hojas ruta
* productos
* reportes

---

# Beneficios

* cache automático
* refetch inteligente
* retries
* invalidación cache
* loading automático

---

# Query Keys

---

# Ejemplos

```text id="jlwm60"
['clients']
['clients', id]
['sales']
['routes']
['collections']
```

---

# Mutations

Todas las operaciones:

* create
* update
* delete
* approve

deberán implementarse mediante:

```text id="jlwm61"
useMutation
```

---

# Auth State

El estado autenticación deberá almacenar:

* access token
* usuario actual
* rol
* permisos
* sociedad activa

---

# Persistencia

Persistir:

```text id="jlwm62"
localStorage
```

solo para:

* refresh token
* preferencias UI

---

# NO Persistir

Nunca persistir:

* información sensible
* datos temporales
* formularios críticos

---

# Form State

Gestionado mediante:

```text id="jlwm63"
React Hook Form
```

---

# Validaciones

Todas las validaciones deberán utilizar:

```text id="jlwm64"
Zod
```

---

# Error Handling

Frontend deberá centralizar:

* errores API
* errores auth
* errores validación

---

# Loading Strategy

Todos los módulos deberán contemplar:

* loading states
* optimistic updates futuros
* skeletons
* empty states

---

# Arquitectura Carpetas

```text id="jlwm65"
src/
├── stores
├── hooks
├── services
├── queries
├── mutations
└── providers
```

---

# Reglas Técnicas

---

# Evitar Prop Drilling

Utilizar:

* context
* Zustand
* custom hooks

---

# Evitar Estado Duplicado

Nunca duplicar:

* server state
* auth state
* query cache

---

# Performance

Optimizar:

* rerenders
* memoization
* lazy loading
* query invalidation

---

# Escalabilidad Futura

Preparado para:

* websocket state
* offline mode
* realtime sync
* microfrontends

---

# Estado Actual

Arquitectura state management aprobada para Fase 1.
