# Canarias System — Products Business Rules

# Objetivo

Documentar las reglas de negocio relacionadas al catálogo de productos.

---

# Descripción

Un producto representa un artículo comercializable dentro del sistema.

Los productos pueden ser utilizados en solicitudes de venta.

---

# Reglas de Producto


## BR-PRODUCT-001

Todo producto debe tener:

- nombre
- descripción opcional
- estado


---

## BR-PRODUCT-002

Un producto debe encontrarse activo para poder ser seleccionado en una venta.


---

## BR-PRODUCT-003

Los productos inactivos no deben aparecer disponibles para nuevos registros comerciales.


---

## BR-PRODUCT-004

La desactivación de un producto no elimina información histórica.


Las ventas existentes deben conservar la referencia al producto utilizado.


---

# Estados del Producto


## ACTIVE

Producto disponible para operaciones.


## INACTIVE

Producto deshabilitado.


---

# Producto en Venta


Cuando un vendedor registra una venta:

- selecciona un producto activo
- el producto queda asociado a la operación
- la información histórica debe conservarse


---

# Validaciones


Antes de crear una venta:

El sistema debe verificar:

- producto existente
- producto activo


---

# Auditoría

Registrar:

- usuario creador
- fecha de creación
- cambios de estado


---

# Estado

Documento vigente Sprint 02.