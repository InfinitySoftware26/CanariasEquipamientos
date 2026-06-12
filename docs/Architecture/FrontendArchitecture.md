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

| Tecnología       | Uso                                           |
| ---------------- | --------------------------------------------- |
| Next.js          | Framework React con App Router y server rendering |
| React            | UI                                            |
| TypeScript       | Tipado                                       |
| TailwindCSS      | Estilos                                      |
| Zustand          | Estado global                                |
| React Query      | Manejo APIs                                  |
| Axios            | HTTP Client                                  |
| pnpm             | Gestor de paquetes del monorepo              |

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
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
├── modules/
├── components/
├── layouts/
├── services/
├── store/
├── hooks/
├── types/
├── utils/
├── constants/
└── globals.css
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
├── sale-validation/
├── products/
├── zones/
├── staff/
├── collections/
├── routes/
├── stock/
├── cash/
└── reports/
```
---

# Clasificacion de Módulos

Actualmente en desarrollo:

auth
clients
sales
sale-validation
products
zones
staff
Installments

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

El sistema utilizará enrutamiento basado en:

```text id="m8f7wx"
Next.js App Router / file-based routing
```

* Las rutas públicas y privadas se definen mediante la estructura de carpetas `src/app/`.
* La protección de páginas se implementa con componentes de autenticación y redirección en frontend.

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

# Autenticación y JWT

El frontend trabajará con tokens JWT desde el login hasta las rutas protegidas.

- usa `NEXT_PUBLIC_API_URL` para apuntar al backend.
- guarda tokens de sesión de forma segura en el state global.
- renueva sesiones cuando sea necesario.
- redirige al login al detectar token inválido o expirado.

---

# Roles y Navegación

La navegación se adapta según:

- rol del usuario
- permisos asignados
- sociedad activa


## SUPER_ADMIN

Ve:

- administración global
- sociedades
- usuarios
- permisos
- configuraciones generales
- reportes globales


## MANAGER

Ve:

- métricas globales
- operaciones de sus sociedades asignadas
- reportes
- supervisión de usuarios


## ADMIN

Ve:

- clientes
- ventas
- validaciones
- documentación
- operaciones administrativas


## SELLER

Ve:

- clientes propios
- carga de ventas
- porcentaje de ganancia


## COLLECTOR

Ve:

- visitas asignadas
- entregas
- cobranzas
- hoja de ruta
---

# Multi-Sociedad

El frontend permite operar con diferentes sociedades dentro de la misma sesión.

- la sociedad activa se guarda en el estado del usuario.
- las consultas se filtran por sociedad.
- la UI muestra contextos empresariales en función de la sociedad seleccionada.

---

# Selector de Sociedad

El frontend deberá incorporar un selector de sociedad cuando el usuario tenga acceso a múltiples sociedades.

---

# Comportamiento

Flujo:

Login
↓
Carga información del usuario
↓
Obtiene sociedades disponibles
↓
Usuario selecciona sociedad activa
↓
Frontend actualiza contexto global
↓
Las consultas utilizan la sociedad seleccionada


---

# Usuarios con Selector

`SUPER_ADMIN`:
Visualiza todas las sociedades.

`MANAGER`:
Visualiza únicamente las sociedades asignadas.
Otros roles:
Operan sobre la sociedad asignada automáticamente.

---

# Estado Global

El contexto deberá almacenar:

- activeSocietyId
- activeSocietyName
- availableSocieties

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

# Dashboard SUPER_ADMIN

* administración global del sistema
* gestión de sociedades
* gestión de usuarios
* creación de roles
* configuración general
* selección de sociedad activa
* reportes consolidados

---

# Dashboard MANAGER

* métricas globales
* balances
* reportes financieros

---

# Dashboard ADMIN

* Clients
* KPIs
* cobranzas
* ventas
* alertas

---

# Dashboard SELLER

* cargar nueva venta
* ventas personales
* comisiones
* objetivos

---

# Dashboard COLLECTOR

* hoja ruta
* cobranzas pendientes
* cierre diario

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
