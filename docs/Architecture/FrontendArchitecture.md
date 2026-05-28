# Canarias System — Frontend Architecture

# Objetivo del Documento

Definir la arquitectura frontend del sistema Canarias System, incluyendo:

* estructura del proyecto
* organización modular
* manejo de estado
* rutas
* layouts
* integración APIs
* convenciones de desarrollo

---

# Stack Tecnológico

| Tecnología   | Uso           |
| ------------ | ------------- |
| React        | UI            |
| TypeScript   | Tipado        |
| TailwindCSS  | Estilos       |
| Zustand      | Estado global |
| React Query  | Manejo APIs   |
| React Router | Navegación    |
| Axios        | HTTP Client   |

---

# Arquitectura General

El frontend seguirá arquitectura modular basada en dominios funcionales.

El objetivo es garantizar:

* escalabilidad
* reutilización
* mantenibilidad
* desacoplamiento

---

# Estructura General

```text id="n7f5sp"
src/
│
├── modules/
├── components/
├── layouts/
├── routes/
├── services/
├── store/
├── hooks/
├── types/
├── utils/
├── constants/
└── main.tsx
```

---

# Arquitectura Modular

```text id="h6s4zq"
modules/
│
├── auth/
├── dashboard/
├── clients/
├── sales/
├── collections/
├── routes/
├── products/
├── stock/
├── cash/
└── reports/
```

---

# Estructura Interna de Módulos

```text id="h2d6te"
module-name/
│
├── pages/
├── components/
├── hooks/
├── services/
├── types/
├── validations/
└── routes.tsx
```

---

# Principios Frontend

---

# Separación de Responsabilidades

* UI separada de lógica
* APIs separadas de componentes
* Estado centralizado
* Formularios desacoplados

---

# Reutilización

Los componentes deberán ser reutilizables.

Ejemplos:

* tables
* modals
* inputs
* cards
* buttons

---

# Escalabilidad

El frontend deberá soportar:

* nuevos módulos
* nuevos dashboards
* nuevos roles
* nuevas sociedades

---

# Layouts

El sistema utilizará layouts diferenciados por contexto.

---

# Layout Principal

Contendrá:

* sidebar
* topbar
* container
* breadcrumbs

---

# Sidebar Dinámica

La navegación cambiará según:

* rol
* permisos
* sociedad

---

# Routing

El sistema utilizará:

```text id="m8f7wx"
React Router
```

---

# Tipos de Ruta

## Públicas

* login

---

## Privadas

* dashboard
* ventas
* cobranzas
* stock
* reportes

---

# Protected Routes

Todas las rutas privadas deberán validar:

* JWT
* sesión
* permisos
* roles

---

# Estado Global

Estado global implementado mediante:

```text id="z4t5qh"
Zustand
```

---

# Estado Global Inicial

* usuario autenticado
* token
* sociedad activa
* permisos
* configuración UI

---

# Manejo de APIs

Las APIs deberán consumirse mediante:

```text id="y6q8mj"
Axios + React Query
```

---

# Organización APIs

```text id="y3h6zn"
services/
│
├── auth.service.ts
├── sales.service.ts
├── clients.service.ts
└── collections.service.ts
```

---

# Formularios

Todos los formularios deberán utilizar:

* validaciones
* tipado
* manejo errores
* estados loading

---

# Validaciones

Las validaciones deberán implementarse mediante:

```text id="x7v3dr"
Zod
```

---

# Manejo de Errores

El frontend deberá manejar:

* errores API
* expiración sesión
* permisos insuficientes
* estados vacíos

---

# Dashboards

Cada rol tendrá dashboard independiente.

---

# Dashboard ADMIN

* KPIs
* cobranzas
* ventas
* alertas

---

# Dashboard SELLER

* ventas personales
* comisiones
* objetivos

---

# Dashboard COLLECTOR

* hoja ruta
* cobranzas pendientes
* cierre diario

---

# Dashboard MANAGER

* métricas globales
* balances
* reportes financieros

---

# Convenciones

---

# Componentes

```text id="o9n6wm"
PascalCase
```

Ejemplo:

```tsx id="g2r6wa"
SalesTable.tsx
DashboardCard.tsx
```

---

# Hooks

```text id="j3k9dx"
camelCase
```

Ejemplo:

```tsx id="f2r8qh"
useAuth
useCollections
```

---

# Archivos

```text id="x7m4be"
kebab-case
```

Ejemplo:

```text id="o8y4wv"
sales-table.tsx
dashboard-card.tsx
```

---

# Consideraciones Técnicas

* Frontend desacoplado
* Backend API-first
* Componentes reutilizables
* Lazy loading futuro
* Arquitectura preparada para mobile

---

# Responsive Design

El sistema deberá ser responsive para:

* desktop
* tablet
* mobile

---

# Consideraciones Futuras

La arquitectura permitirá incorporar:

* PWA
* aplicación mobile
* notificaciones push
* geolocalización
* modo offline parcial

---

# Estado Actual

Fase inicial de construcción arquitectónica frontend.
