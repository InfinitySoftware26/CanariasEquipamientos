# Canarias System — Products Business Rules

# Objetivo

Documentar las reglas de negocio relacionadas al catálogo de productos.

---

# Descripción

Un producto representa un artículo comercializable dentro del sistema.

Los productos pueden ser utilizados en operaciones de venta y deben conservar su información histórica aunque posteriormente sean desactivados.

---

# Reglas de Producto

## BR-PRODUCT-001

Todo producto debe tener:

* nombre
* marca
* modelo
* precio
* category
* estado

La descripción es opcional.

---

## BR-PRODUCT-002

Un producto debe encontrarse en estado `ACTIVE` para poder ser seleccionado en una nueva venta/plan/promocion.

---

## BR-PRODUCT-003

Los productos `INACTIVE` no deben aparecer como productos disponibles para nuevas operaciones comerciales.

---

## BR-PRODUCT-004

La desactivación de un producto no elimina información histórica.

---

## BR-PRODUCT-005

Los productos pertenecen al contexto de una sociedad.

Las consultas y operaciones deben respetar la sociedad activa del usuario.

---

# Estados del Producto

## ACTIVE

Producto disponible para operaciones comerciales.

---

## INACTIVE

Producto deshabilitado para nuevas operaciones.

La información histórica debe conservarse.

---

# Producto Devuelto

## BR-PRODUCT-006

El sistema debe permitir identificar un producto como producto devuelto mediante una propiedad específica.

La identificación de producto devuelto:

* no debe crear una relación con `Plan/Promotion`;
* no modifica la existencia del producto dentro del catálogo;
* permite que el producto continúe apareciendo en el listado pero diferenciado;
* permite seleccionarlo posteriormente dentro del plan comercial correspondiente.

---

## BR-PRODUCT-007

El producto devuelto debe conservar la misma identidad de producto dentro del sistema.

La marca de producto devuelto no debe crear un producto independiente.

---

## BR-PRODUCT-008

La condición de producto devuelto es independiente del estado operativo del producto.

Por lo tanto, un producto puede encontrarse, por ejemplo, como:

```text
status = ACTIVE
isReturned = true
```

La propiedad utilizada para identificar el producto devuelto no reemplaza al estado del producto.

---

## BR-PRODUCT-009

El Frontend podrá diferenciar visualmente los productos devueltos para facilitar su identificación al usuario administrativo.

---

# Precio

## BR-PRODUCT-010

Cada producto debe mantener un precio vigente.

El precio puede modificarse individualmente.

---

## BR-PRODUCT-011

El precio utilizado en una venta debe conservarse dentro de la operación histórica de venta.

La entidad `SALE_PRODUCTS` actualmente conserva:

* `unitPrice`
* `quantity`
* `subtotal`

Por lo tanto, una modificación posterior del precio del producto no debe modificar el precio histórico de una venta existente.

---

# Ventas

## BR-PRODUCT-012

Cuando un producto participa en una venta:

* debe existir el producto;
* debe encontrarse disponible para la operación;
* debe registrarse la cantidad;
* debe registrarse el precio unitario utilizado;
* debe registrarse el subtotal.

---

## BR-PRODUCT-013

El historial de ventas debe conservarse aunque el producto posteriormente pase a `INACTIVE` o `DISCONTINUED`.

---

## BR-PRODUCT-014

La información histórica de `SALE_PRODUCTS` debe conservarse aunque posteriormente se modifique:

* precio actual;
* estado;
* condición de producto devuelto;
* información comercial no histórica del producto.

---

# Productos Más Vendidos

## BR-PRODUCT-015

El sistema deberá permitir obtener un índice de ventas por producto.

El índice deberá utilizar la información histórica registrada en `SALE_PRODUCTS`.

Como mínimo deberá poder determinar la cantidad total de unidades vendidas por producto.

---

# Financiación

## BR-PRODUCT-016

La financiación no se almacena directamente como una propiedad del producto.

La relación con financiación se gestiona mediante las configuraciones, planes y promociones correspondientes.

---

## BR-PRODUCT-017

Un producto puede participar en configuraciones específicas de financiación mediante las relaciones correspondientes.

Las reglas completas de financiación se encuentran documentadas en:

```text
docs/Bussines-Rules/Financings.md
```

---

# Eliminación

## BR-PRODUCT-018

Los productos no deben eliminarse físicamente.

La eliminación operativa se realiza mediante desactivación.

---

# Integración con Ventas

## BR-PRODUCT-019

La información histórica de una venta debe conservar el precio aplicado al momento de la operación.

Un cambio posterior del precio del producto no debe modificar una venta existente.

---

# Estado

Documento actualizado Sprint 05.

Backend parcialmente desarrollado.

Reglas pendientes de implementación:

* eliminación de categorías;
* identificación de productos devueltos;
