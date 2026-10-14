# Canarias System — Products API

# Objetivo

Documentar el módulo de productos del sistema.

El módulo será responsable de:

* gestión productos
* precios
* configuración comercial
* proveedores
* control disponibilidad
* identificación de productos devueltos
* historial de ventas por producto
* estadísticas de ventas por producto

---

# Módulo Backend

```text
backend/src/modules/products/
```

El módulo actualmente cuenta con:

* `ProductsController`
* `ProductsService`
* `ProductsRepository`
* `Product` entity
* `CreateProductDto`
* `UpdateProductDto`

---

# Endpoint Base

```http
/api/v1/products
```

---

# Roles Permitidos

| Rol         | Acceso                 |
| ----------- | ---------------------- |
| ADMIN       | Completo               |
| MANAGER     | Completo               |
| SUPER_ADMIN | Completo               |
| SELLER      | Lectura                |
| COLLECTOR   | Acceso según operación |

Los endpoints requieren:

* `JwtAuthGuard`
* `RolesGuard`
* `SocietyGuard`

El `societyId` se obtiene del usuario autenticado.

---

# Estados Producto

| Estado       | Descripción            |
| ------------ | ---------------------- |
| ACTIVE       | Producto disponible    |
| INACTIVE     | Producto desactivado   |
| DISCONTINUED | Producto descontinuado |

El estado `INACTIVE` se utiliza actualmente para la desactivación lógica del producto.

---

# Endpoints

---

# Crear Producto

## Endpoint

```http
POST /products
```

---

# Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Request Actual

```json
{
  "name": "Heladera No Frost",
  "brand": "Samsung",
  "model": "RT32K5730S8",
  "category": "Electrodomésticos",
  "description": "Heladera No Frost",
  "price": 480000,
  "costPrice": 340000
}
```

---

# Campos Actuales

| Campo       | Tipo   | Obligatorio |
| ----------- | ------ | ----------- |
| name        | string | Sí          |
| brand       | string | Sí          |
| model       | string | Sí          |
| category    | string | No          |
| description | string | No          |
| price       | number | Sí          |
| costPrice   | number | No          |

---

# Producto Devuelto

El producto debe contar con una propiedad específica que permita identificarlo como producto devuelto.

Esta propiedad:

* no representa un estado del producto;
* no debe relacionarse con `Promotion`;
* no debe crear una relación nueva con promociones;
* debe permitir que el producto continúe apareciendo en el listado general;
* permitirá utilizarlo posteriormente dentro del plan comercial correspondiente;
* deberá permitir diferenciarlo visualmente en el Frontend.

La propiedad y su nombre definitivo todavía no existen en el código actual.

---

# Response Success

Actualmente el servicio retorna la entidad `Product` creada.

No existe actualmente un wrapper obligatorio con:

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "uuid"
  }
}
```

Por lo tanto, la documentación de integración debe utilizar la respuesta real del servicio hasta que se defina formalmente un nuevo contrato.

---

# Obtener Productos

## Endpoint

```http
GET /products
```

---

# Roles

El endpoint está protegido por autenticación y contexto de sociedad.

Actualmente devuelve únicamente productos:

```text
status = ACTIVE
```

y los ordena por:

```text
name ASC
```

---

# Comportamiento Actual

La consulta recibe:

```text
societyId
```

desde el JWT.

El repositorio ejecuta la consulta dentro de la sociedad correspondiente.

---

# Filtros

El controller actual no implementa:

* page
* limit
* category
* status
* supplierId

Por lo tanto, esos query params no deben considerarse rutas o funcionalidades implementadas actualmente.

---

# Obtener Producto

## Endpoint

```http
GET /products/:id
```

---

# Comportamiento

Obtiene un producto mediante su `productId`.

Actualmente devuelve el producto mediante `ProductsService.findById()`.

---

# Actualizar Producto

## Endpoint

```http
PATCH /products/:id
```

---

# Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Request

El endpoint utiliza:

```text
UpdateProductDto
```

que actualmente es un `PartialType(CreateProductDto)`.

Por lo tanto, permite actualizar parcialmente los campos existentes del producto.

---

# Precio Individual

Actualmente el precio puede modificarse mediante:

```http
PATCH /products/:id
```

utilizando:

```json
{
  "price": 520000
}
```

El cambio de precio actualmente no posee un historial específico de auditoría.

La auditoría de precios debe incorporarse como parte de la evolución del módulo.

---

# Actualización Global de Precios

Se requiere incorporar una operación que permita modificar los precios de múltiples productos mediante un aumento global.

Esta funcionalidad no existe actualmente en el controller, service ni repository revisados.

El endpoint y DTO específicos deberán definirse durante su implementación.

La operación deberá contemplar:

* porcentaje o criterio de aumento definido por negocio;
* actualización de los productos alcanzados;
* conservación del precio anterior;
* nuevo precio;
* registro de fecha;
* usuario que realizó la operación.

---

# Desactivar Producto

## Endpoint

```http
DELETE /products/:id
```

---

# Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Comportamiento

El producto no se elimina físicamente.

El servicio actual modifica:

```text
status = INACTIVE
```

y responde:

```http
204 No Content
```

---

# Historial de Ventas del Producto

El sistema debe conservar la relación histórica entre productos y ventas.

Actualmente existe:

```text
SALE_PRODUCTS
```

con:

* `saleId`
* `productId`
* `quantity`
* `unitPrice`
* `subtotal`
* `customDetails`
* `createdAt`

Esto permite conservar el producto utilizado en una venta y el precio aplicado en ese momento.

No existe actualmente un endpoint específico para consultar el historial de ventas de un producto.

La implementación de dicha consulta debe desarrollarse.

---

# Índice de Ventas por Producto

Se requiere poder consultar posteriormente cuál es el producto más vendido.

El cálculo deberá basarse en el historial de `SALE_PRODUCTS`, utilizando como mínimo la cantidad vendida.

No existe actualmente un endpoint específico de estadísticas de productos.

La implementación deberá incorporar:

* endpoint;
* agregación;
* ordenamiento;
* respuesta estadística;
* filtros temporales, cuando sean definidos por negocio.

---

# Regla Financiera

La financiación no se asigna directamente al producto.

El producto puede formar parte de las relaciones:

```text
FINANCING_CONFIG_PRODUCTS

FINANCING_PLAN_PRODUCTS

PROMOTION_PRODUCTS
```

cuando las configuraciones correspondientes utilizan asociaciones específicas por producto.

Las configuraciones globales aplican según las reglas definidas en:

```text
docs/Api/Financing.md

docs/Bussines-Rules/Financings.md
```

El producto devuelto no debe crear una relación especial con `Promotion`.

---

# Auditoría

El módulo debe conservar información suficiente para auditar:

* creación del producto;
* modificación de datos;
* cambios de precio;
* cambios de estado;
* identificación como producto devuelto;
* modificaciones realizadas mediante aumentos globales.

Actualmente la auditoría específica de precios y aumentos globales todavía no está implementada.

---

# Seguridad

* JWT obligatorio.
* `RolesGuard`.
* `SocietyGuard`.
* Las operaciones de escritura están restringidas a ADMIN, MANAGER y SUPER_ADMIN.
* El `societyId` se obtiene del JWT para las operaciones que ya lo implementan.

---

# Reglas de Eliminación

Los productos utilizados en ventas no deben eliminarse físicamente.

La desactivación debe conservar:

* producto;
* relación con ventas;
* cantidad vendida;
* precio histórico;
* información de la operación.

---

# Escalabilidad Futura

El módulo queda preparado para:

* historial de precios;
* aumentos globales;
* estadísticas de productos vendidos;
* promociones;
* variantes;
* imágenes;
* ecommerce;
* catálogo mobile.

---

# Estado

Documento actualizado Sprint 05.

Backend parcialmente desarrollado.

Frontend de productos existente únicamente como placeholder.

Integración Back ↔ Front pendiente para el desarrollo completo del módulo.

Funcionalidades pendientes:

* identificación de producto devuelto;
* historial específico de precios;
* aumento global de precios;
* consulta de historial de ventas por producto;
* índice/estadística de productos más vendidos.
