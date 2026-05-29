# Canarias System — UI Kit

# Objetivo

Documentar el sistema visual frontend del proyecto.

El UI Kit será responsable de garantizar:

* consistencia visual
* reutilización componentes
* experiencia operativa uniforme
* escalabilidad frontend
* mantenibilidad UI

---

# Tecnologías

| Tecnología   | Uso              |
| ------------ | ---------------- |
| TailwindCSS  | Estilos          |
| Shadcn UI    | Base componentes |
| Lucide React | Iconografía      |

---

# Principios Diseño

El sistema deberá priorizar:

* simplicidad
* velocidad operativa
* claridad visual
* bajo ruido visual
* consistencia

---

# Filosofía UX

Canarias System es un:

```text id="jlwm68"
sistema operativo empresarial
```

por lo tanto la UI deberá:

* priorizar productividad
* minimizar clicks
* mostrar información crítica
* evitar complejidad visual innecesaria

---

# Sistema Colores

---

# Estados

| Estado  | Uso                   |
| ------- | --------------------- |
| Success | Operaciones correctas |
| Warning | Alertas               |
| Error   | Errores críticos      |
| Info    | Información general   |

---

# Reglas

* evitar exceso colores
* priorizar tonos neutros
* utilizar colores estados consistentemente

---

# Tipografía

---

# Principios

* legibilidad
* jerarquía clara
* tamaños consistentes

---

# Jerarquías

| Elemento   | Uso                    |
| ---------- | ---------------------- |
| Heading XL | Dashboards             |
| Heading L  | Secciones              |
| Heading M  | Cards                  |
| Body       | Texto normal           |
| Caption    | Información secundaria |

---

# Spacing

Utilizar spacing consistente basado en:

```text id="jlwm69"
4px grid system
```

---

# Componentes Base

---

# Buttons

Todos los botones deberán poseer variantes:

* primary
* secondary
* destructive
* outline
* ghost

---

# Estados

* default
* loading
* disabled
* hover
* active

---

# Inputs

Todos los inputs deberán incluir:

* label
* placeholder
* validation
* helper text
* error state

---

# Cards

Las cards deberán utilizarse para:

* dashboards
* métricas
* resúmenes
* widgets

---

# Tables

Las tablas deberán soportar:

* paginación
* filtros
* sorting
* loading
* responsive

---

# Dialogs

Los modales deberán utilizarse únicamente para:

* confirmaciones
* acciones rápidas
* formularios pequeños

---

# Toast Notifications

El sistema deberá soportar:

* success toast
* error toast
* warning toast
* info toast

---

# Loading States

Todos los componentes async deberán contemplar:

* skeleton loaders
* spinners
* empty states

---

# Iconografía

Utilizar:

```text id="jlwm70"
Lucide React
```

como sistema principal iconos.

---

# Responsive Design

El sistema deberá diseñarse:

* desktop first
* tablet compatible
* mobile ready futuro

---

# Reutilización

Todos los componentes deberán centralizarse en:

```text id="jlwm71"
src/components/ui
```

---

# Estructura Recomendada

```text id="jlwm72"
src/
├── components
│   ├── ui
│   ├── forms
│   ├── tables
│   ├── layout
│   └── dashboards
```

---

# Accesibilidad

La UI deberá contemplar:

* focus states
* keyboard navigation
* semantic HTML
* aria labels futuros

---

# Performance

Optimizar:

* rerenders
* bundle size
* lazy loading
* component splitting

---

# Escalabilidad Futura

Preparado para:

* dark mode
* themes
* white label
* mobile app
* microfrontends

---

# Estado Actual

UI Kit aprobado para Fase 1.
