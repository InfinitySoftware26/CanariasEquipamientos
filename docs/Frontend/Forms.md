# Canarias System — Forms

# Objetivo

Documentar la arquitectura de formularios del sistema.

El sistema será altamente dependiente de formularios operativos.

---

# Principios UX

Los formularios deberán priorizar:

* rapidez carga
* simplicidad
* validaciones claras
* mínima fricción operativa

---

# Tecnologías

| Tecnología      | Uso                |
| --------------- | ------------------ |
| React Hook Form | Manejo formularios |
| Zod             | Validaciones       |
| Shadcn UI       | Componentes UI     |

---

# Arquitectura Formularios

Todos los formularios deberán:

* ser reutilizables
* desacoplados
* tipados
* validados frontend/backend

---

# Estructura

```text id="jlwm66"
src/
├── forms
├── schemas
├── validators
└── components/forms
```

---

# Validaciones

Todas las validaciones deberán implementarse mediante:

```text id="jlwm67"
Zod
```

---

# Reglas Validación

---

# Frontend

Validaciones rápidas UX.

---

# Backend

Validación final obligatoria.

---

# Formularios Principales

---

# Cliente

## Campos

* nombre completo
* DNI
* teléfono
* dirección
* referencias
* zona
* sociedad

---

# Venta

## Campos

* cliente
* producto
* observaciones
* dirección entrega

---

# Pago

## Campos

* cuotas
* monto
* método pago
* observaciones

---

# Producto

## Campos

* nombre
* categoría
* precio
* proveedor
* financiación

---

# Estados Formularios

Todos los formularios deberán contemplar:

* idle
* loading
* success
* error

---

# Error Handling

Mostrar:

* mensajes claros
* errores campo específicos
* errores backend centralizados

---

# UX Requerida

---

# Inputs

Todos los inputs deberán poseer:

* labels
* placeholders
* errores visibles
* estados disabled

---

# Submit

Todos los submit deberán:

* bloquear doble envío
* mostrar loading
* manejar retries futuros

---

# Formularios Multi Step

Preparado para:

* onboarding clientes
* ventas complejas
* procesos validación

---

# Componentización

Todos los formularios deberán reutilizar:

* Input
* Select
* DatePicker
* CurrencyInput
* TextArea

---

# Accesibilidad

Los formularios deberán soportar:

* navegación teclado
* labels accesibles
* focus states

---

# Performance

Optimizar:

* rerenders
* validaciones innecesarias
* formularios extensos

---

# Escalabilidad Futura

Preparado para:

* formularios dinámicos
* schemas remotos
* auto save
* offline forms

---

# Estado Actual

Arquitectura formularios aprobada para Fase 1.
