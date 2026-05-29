# Canarias System — Tables

# Objetivo

Documentar la arquitectura de tablas reutilizables del sistema.

Las tablas serán uno de los componentes más utilizados del sistema operativo.

---

# Objetivos Técnicos

Las tablas deberán soportar:

* grandes volúmenes datos
* filtros
* búsquedas
* paginación
* ordenamiento
* acciones rápidas
* responsive futuro

---

# Tecnología Recomendada

| Tecnología     | Uso           |
| -------------- | ------------- |
| TanStack Table | Manejo tablas |
| React Query    | Server state  |
| Shadcn UI      | UI base       |

---

# Arquitectura

Todas las tablas deberán ser:

* reutilizables
* desacopladas
* tipadas
* configurables

---

# Estructura Recomendada

```text id="jlwm73"
src/
├── components
│   └── tables
│       ├── data-table.tsx
│       ├── columns
│       ├── filters
│       └── actions
```

---

# Funcionalidades Obligatorias

---

# Paginación

Todas las tablas deberán soportar:

* page
* limit
* total records

---

# Ordenamiento

Soportar sorting por columnas.

---

# Filtros

Soportar:

* búsqueda texto
* filtros estado
* fechas
* relaciones
* select dinámicos

---

# Loading States

Las tablas deberán contemplar:

* skeleton loading
* empty state
* error state

---

# Acciones

Cada fila podrá incluir:

* view
* edit
* approve
* reject
* delete

según permisos usuario.

---

# Columnas

Las columnas deberán:

* ser reutilizables
* tipadas
* configurables
* desacopladas lógica negocio

---

# Ejemplo Arquitectura

```text id="jlwm74"
clients.columns.ts
sales.columns.ts
collections.columns.ts
routes.columns.ts
```

---

# Server Side Rendering

Las tablas deberán implementar:

```text id="jlwm75"
server side pagination
```

para evitar problemas performance.

---

# Selección Filas

Preparado para:

* bulk actions
* exportaciones
* operaciones masivas

---

# Responsive

En mobile futuro:

* ocultar columnas secundarias
* cards adaptativas
* scroll horizontal

---

# Performance

Optimizar:

* memoization
* virtualización futura
* lazy rendering
* query caching

---

# Estados UI

---

# Empty State

Mostrar mensajes claros cuando no existan registros.

---

# Error State

Mostrar errores amigables y reintentos.

---

# Permissions

Las acciones deberán renderizarse según:

* rol
* permisos
* sociedad activa

---

# Seguridad

Nunca exponer:

* acciones no autorizadas
* columnas sensibles
* datos restringidos

---

# Escalabilidad Futura

Preparado para:

* export excel
* export pdf
* realtime updates
* infinite scrolling
* column personalization

---

# Estado Actual

Arquitectura tablas aprobada para Fase 1.
# Canarias System — Tables

# Objetivo

Documentar la arquitectura de tablas reutilizables del sistema.

Las tablas serán uno de los componentes más utilizados del sistema operativo.

---

# Objetivos Técnicos

Las tablas deberán soportar:

* grandes volúmenes datos
* filtros
* búsquedas
* paginación
* ordenamiento
* acciones rápidas
* responsive futuro

---

# Tecnología Recomendada

| Tecnología     | Uso           |
| -------------- | ------------- |
| TanStack Table | Manejo tablas |
| React Query    | Server state  |
| Shadcn UI      | UI base       |

---

# Arquitectura

Todas las tablas deberán ser:

* reutilizables
* desacopladas
* tipadas
* configurables

---

# Estructura Recomendada

```text id="jlwm73"
src/
├── components
│   └── tables
│       ├── data-table.tsx
│       ├── columns
│       ├── filters
│       └── actions
```

---

# Funcionalidades Obligatorias

---

# Paginación

Todas las tablas deberán soportar:

* page
* limit
* total records

---

# Ordenamiento

Soportar sorting por columnas.

---

# Filtros

Soportar:

* búsqueda texto
* filtros estado
* fechas
* relaciones
* select dinámicos

---

# Loading States

Las tablas deberán contemplar:

* skeleton loading
* empty state
* error state

---

# Acciones

Cada fila podrá incluir:

* view
* edit
* approve
* reject
* delete

según permisos usuario.

---

# Columnas

Las columnas deberán:

* ser reutilizables
* tipadas
* configurables
* desacopladas lógica negocio

---

# Ejemplo Arquitectura

```text id="jlwm74"
clients.columns.ts
sales.columns.ts
collections.columns.ts
routes.columns.ts
```

---

# Server Side Rendering

Las tablas deberán implementar:

```text id="jlwm75"
server side pagination
```

para evitar problemas performance.

---

# Selección Filas

Preparado para:

* bulk actions
* exportaciones
* operaciones masivas

---

# Responsive

En mobile futuro:

* ocultar columnas secundarias
* cards adaptativas
* scroll horizontal

---

# Performance

Optimizar:

* memoization
* virtualización futura
* lazy rendering
* query caching

---

# Estados UI

---

# Empty State

Mostrar mensajes claros cuando no existan registros.

---

# Error State

Mostrar errores amigables y reintentos.

---

# Permissions

Las acciones deberán renderizarse según:

* rol
* permisos
* sociedad activa

---

# Seguridad

Nunca exponer:

* acciones no autorizadas
* columnas sensibles
* datos restringidos

---

# Escalabilidad Futura

Preparado para:

* export excel
* export pdf
* realtime updates
* infinite scrolling
* column personalization

---

# Estado Actual

Arquitectura tablas aprobada para Fase 1.
