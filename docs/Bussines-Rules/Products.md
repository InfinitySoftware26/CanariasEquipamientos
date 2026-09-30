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
* estado

La descripción es opcional.

---

## BR-PRODUCT-002

Un producto debe encontrarse en estado `ACTIVE` para poder ser seleccionado en una nueva venta.

---

## BR-PRODUCT-003

Los productos `INACTIVE` no deben aparecer como productos disponibles para nuevas operaciones comerciales.

---

## BR-PRODUCT-004

La desactivación de un producto no elimina información histórica.

Las ventas existentes deben conservar la referencia al producto utilizado.

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

## DISCONTINUED

Producto descontinuado.

La utilización de este estado debe respetar el flujo que se defina para productos discontinuados.

---

# Producto Devuelto

## BR-PRODUCT-006

El sistema debe permitir identificar un producto como producto devuelto mediante una propiedad específica.

La identificación de producto devuelto:

* no constituye una `Promotion`;
* no debe crear una relación con `Promotion`;
* no modifica la existencia del producto dentro del catálogo;
* permite que el producto continúe apareciendo en el listado;
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

La forma visual todavía no está definida.

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

# Historial de Precios

## BR-PRODUCT-012

Los cambios de precio deben poder auditarse.

La auditoría deberá permitir identificar:

* precio anterior;
* precio nuevo;
* fecha del cambio;
* usuario que realizó el cambio.

La implementación de este historial todavía está pendiente.

---

# Aumento Global de Precios

## BR-PRODUCT-013

El sistema deberá permitir realizar un aumento de precios sobre múltiples productos de una sociedad.

La operación deberá:

* aplicar el criterio de aumento definido;
* actualizar los precios alcanzados;
* conservar el precio anterior;
* registrar el nuevo precio;
* registrar el usuario responsable;
* registrar la fecha de la operación.

La funcionalidad todavía no está implementada.

---

## BR-PRODUCT-014

El aumento global de precios no debe modificar los precios históricos registrados en ventas existentes.

El cambio únicamente afecta el precio vigente de los productos alcanzados por la operación.

---

# Ventas

## BR-PRODUCT-015

Cuando un producto participa en una venta:

* debe existir el producto;
* debe encontrarse disponible para la operación;
* debe registrarse la cantidad;
* debe registrarse el precio unitario utilizado;
* debe registrarse el subtotal.

---

## BR-PRODUCT-016

El historial de ventas debe conservarse aunque el producto posteriormente pase a `INACTIVE` o `DISCONTINUED`.

---

# Historial de Ventas por Producto

## BR-PRODUCT-017

El sistema deberá permitir consultar el historial de ventas asociado a un producto.

La información deberá basarse en las relaciones existentes entre:

```text
PRODUCTS

SALE_PRODUCTS

SALES
```

La implementación del endpoint de consulta todavía está pendiente.

---

## BR-PRODUCT-018

La información histórica de `SALE_PRODUCTS` debe conservarse aunque posteriormente se modifique:

* precio actual;
* estado;
* condición de producto devuelto;
* información comercial no histórica del producto.

---

# Productos Más Vendidos

## BR-PRODUCT-019

El sistema deberá permitir obtener un índice de ventas por producto.

El índice deberá utilizar la información histórica registrada en `SALE_PRODUCTS`.

Como mínimo deberá poder determinar la cantidad total de unidades vendidas por producto.

---

## BR-PRODUCT-020

El cálculo de productos más vendidos no debe depender del precio actual del producto.

Debe utilizar los datos históricos registrados en las ventas.

---

## BR-PRODUCT-021

La consulta de estadísticas podrá utilizar períodos de tiempo cuando dicha funcionalidad sea incorporada.

Los filtros temporales todavía no están definidos en la implementación actual.

---

## BR-PRODUCT-022

Las estadísticas deberán poder calcularse a partir del historial de ventas sin modificar ni eliminar los registros históricos utilizados para el cálculo.

---

# Categorías

## BR-PRODUCT-023

Las categorías no forman parte del modelo funcional definitivo de productos.

El campo `category` actualmente existe en:

* Entity;
* DTO;
* Seed.

Su eliminación requiere una modificación coordinada del modelo de datos y del código.

---

# Financiación

## BR-PRODUCT-024

La financiación no se almacena directamente como una propiedad del producto.

La relación con financiación se gestiona mediante las configuraciones, planes y promociones correspondientes.

---

## BR-PRODUCT-025

Un producto puede participar en configuraciones específicas de financiación mediante las relaciones correspondientes.

Las reglas completas de financiación se encuentran documentadas en:

```text
docs/Bussines-Rules/Financings.md
```

---

# Eliminación

## BR-PRODUCT-026

Los productos no deben eliminarse físicamente.

La eliminación operativa se realiza mediante desactivación.

---

## BR-PRODUCT-027

Un producto utilizado históricamente en ventas debe conservarse para mantener la integridad histórica de las operaciones.

---

# Auditoría

## BR-PRODUCT-028

El sistema debe registrar los cambios relevantes realizados sobre productos.

Como mínimo:

* creación;
* modificación;
* cambios de precio;
* cambios de estado;
* identificación como producto devuelto;
* aumentos globales.

---

# Integración con Ventas

## BR-PRODUCT-029

La información histórica de una venta debe conservar el precio aplicado al momento de la operación.

Un cambio posterior del precio del producto no debe modificar una venta existente.

---

# Estado

Documento actualizado Sprint 05.

Backend parcialmente desarrollado.

Reglas pendientes de implementación:

* eliminación de categorías;
* identificación de productos devueltos;
* historial de precios;
* aumento global de precios;
* consulta de historial de ventas;
* índice de productos más vendidos.
