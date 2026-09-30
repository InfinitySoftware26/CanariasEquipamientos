# Canarias System — Products Frontend / Backend Integration

# Objetivo

Definir la integración entre el frontend Next.js y el backend NestJS del módulo Products.

El módulo debe trabajar con datos reales del backend.

No se deben utilizar productos, precios, estadísticas ni proveedores hardcodeados.

---

# Endpoint Base

```http
/api/v1/products
```

El frontend utilizará la URL configurada:

```text
NEXT_PUBLIC_API_URL
```

y agregará:

```text
/api/v1/products
```

---

# Autenticación

Todas las solicitudes requieren sesión autenticada.

El frontend debe utilizar el mecanismo de autenticación existente en el proyecto.

Las solicitudes deberán respetar:

```text
JWT
societyId
rol
```

La sociedad activa debe determinar qué productos se muestran.

---

# Types

El tipo principal deberá contemplar como mínimo:

```ts
export interface Product {
  productId: string;
  name: string;
  brand: string;
  model: string;
  description?: string | null;
  price: number;
  costPrice?: number | null;
  supplierId?: string | null;
  hasStockControl: boolean;
  isReturned: boolean;
  status: ProductStatus;
  societyId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

# Product Status

El frontend debe utilizar los estados existentes del backend:

```ts
export type ProductStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "DISCONTINUED";
```

No crear nuevos nombres de estado en frontend.

---

# Listar Productos

## Request

```http
GET /api/v1/products
```

### Query

```text
page
limit
search
status
supplierId
isReturned
```

### Service

```ts
getProducts(params)
```

### Uso

La pantalla `/products` debe mostrar:

* nombre
* marca
* modelo
* precio
* proveedor
* estado
* disponibilidad
* indicador de producto devuelto

---

# Crear Producto

## Request

```http
POST /api/v1/products
```

### Body

```json
{
  "name": "Smart TV Samsung 50",
  "brand": "Samsung",
  "model": "UN50",
  "description": "Smart TV 50 pulgadas",
  "price": 450000,
  "costPrice": 320000,
  "supplierId": "uuid",
  "hasStockControl": false,
  "isReturned": false
}
```

### Frontend

Crear:

```text
CreateProductForm
```

El formulario debe validar antes de enviar.

---

# Obtener Producto

## Request

```http
GET /api/v1/products/:id
```

### Service

```ts
getProductById(id)
```

La vista de detalle debe mostrar la información completa disponible.

---

# Actualizar Producto

## Request

```http
PATCH /api/v1/products/:id
```

### Body

```json
{
  "name": "Smart TV Samsung 50",
  "price": 490000,
  "isReturned": true,
  "status": "ACTIVE"
}
```

### Service

```ts
updateProduct(id, payload)
```

---

# Cambio Individual de Precio

El cambio de precio se realiza mediante:

```http
PATCH /api/v1/products/:id
```

El frontend debe detectar cuando cambia:

```text
price
```

y mostrar confirmación antes de guardar.

Ejemplo:

```text
Precio actual: $450.000
Nuevo precio: $490.000
```

---

# Aumento Global

## Endpoint

```http
PATCH /api/v1/products/prices/bulk-increase
```

### Body

```json
{
  "percentage": 10,
  "productIds": [],
  "includeReturned": true
}
```

### Service

```ts
bulkIncreasePrices(payload)
```

---

# Flujo Frontend

1. ADMIN ingresa a Productos.
2. Selecciona "Aumento global".
3. Ingresa porcentaje.
4. Decide si incluye productos devueltos.
5. Opcionalmente selecciona productos específicos.
6. El frontend muestra resumen.
7. ADMIN confirma.
8. Se ejecuta el request.
9. Se actualiza el listado.
10. Se muestra resultado de la operación.

---

# Producto Devuelto

El frontend debe representar:

```ts
isReturned === true
```

como una característica visual del producto.

Ejemplo:

```text
Smart TV Samsung 50
DEVUELTO
```

No debe sacarse del listado.

No debe crearse una vista separada exclusivamente para productos devueltos.

No debe relacionarse visual ni técnicamente con `Promotion`.

---

# Historial de Ventas

## Endpoint

```http
GET /api/v1/products/:id/sales-history
```

### Query

```text
page
limit
from
to
```

### Service

```ts
getProductSalesHistory(id, params)
```

### Vista

La ficha del producto podrá contener una sección:

```text
Historial de ventas
```

Mostrando:

* fecha
* venta
* cliente
* vendedor
* cantidad
* precio unitario
* subtotal

---

# Estadísticas de Producto

## Endpoint

```http
GET /api/v1/products/:id/statistics
```

### Query

```text
from
to
```

### Service

```ts
getProductStatistics(id, params)
```

### Información

```ts
interface ProductStatistics {
  productId: string;
  unitsSold: number;
  salesCount: number;
  totalSalesAmount: number;
}
```

---

# Productos Más Vendidos

## Endpoint

```http
GET /api/v1/products/statistics/top-selling
```

### Query

```text
from
to
limit
includeReturned
```

### Service

```ts
getTopSellingProducts(params)
```

### Respuesta

```ts
interface TopSellingProduct {
  productId: string;
  name: string;
  brand: string;
  model: string;
  unitsSold: number;
  salesCount: number;
  totalSalesAmount: number;
}
```

---

# Vista de Estadísticas

La pantalla de productos podrá incorporar una sección:

```text
Estadísticas
```

con:

* período desde/hasta
* cantidad de productos a mostrar
* unidades vendidas
* cantidad de ventas
* monto vendido

La información debe venir del endpoint.

No calcular el ranking con datos solamente cargados en frontend.

---

# Hooks

Se recomienda mantener hooks separados:

```text
useProducts
useProduct
useCreateProduct
useUpdateProduct
useBulkIncreasePrices
useProductSalesHistory
useProductStatistics
useTopSellingProducts
```

---

# React Query

Las operaciones de consulta deberán utilizar el mecanismo existente de React Query.

Después de:

```text
create
update
bulk increase
```

se deben invalidar/refrescar las queries correspondientes.

Como mínimo:

```text
products
product/:id
product-statistics
top-selling
```

según corresponda.

---

# Manejo de Errores

El frontend debe contemplar:

```text
400
401
403
404
500
```

### 400

Mostrar el mensaje de validación recibido.

### 401

Utilizar el comportamiento global de sesión existente.

### 403

Mostrar que el usuario no tiene permisos para realizar la operación.

### 404

Mostrar que el producto no existe.

### 500

Mostrar error general y permitir reintentar.

---

# Permisos Frontend

## ADMIN

Mostrar:

* Crear producto
* Editar producto
* Cambiar precio
* Aumento global
* Cambiar estado
* Marcar como devuelto
* Historial
* Estadísticas

## MANAGER

Mostrar:

* Listado
* Detalle
* Historial
* Estadísticas

No mostrar operaciones de escritura.

## SELLER

Mostrar:

* productos disponibles
* detalle necesario para ventas

No mostrar configuración administrativa.

## COLLECTOR

No mostrar módulo operativo de Products.

---

# Eliminación de Categorías

El frontend NO debe implementar:

```text
category
categoryId
category filter
category selector
```

La navegación y los formularios tampoco deben depender de categorías.

---

# Eliminación / Soft Delete

Si el backend expone eliminación:

```http
DELETE /api/v1/products/:id
```

el frontend debe solicitar confirmación.

No eliminar físicamente información relacionada con ventas.

---

# Estados de UI

Todas las pantallas deben contemplar:

```text
loading
empty
error
success
```

---

# Integración con Sales

El historial y las estadísticas deben reflejar las ventas reales.

Relación:

```text
Products
   ↓
SaleProduct
   ↓
Sales
```

El frontend no debe mantener contadores locales de ventas.

---

# Integración con Financing

Products no administra directamente la financiación.

La selección de planes y promociones debe utilizar el módulo Financing.

No crear:

```text
product.financingConfigurationId
```

---

# Criterio de Integración Completa

Products queda integrado cuando:

* `/products` no es placeholder
* listado conectado al backend
* creación conectada
* edición conectada
* cambio individual de precio conectado
* aumento global conectado
* `isReturned` conectado
* historial conectado
* estadísticas conectadas
* top-selling conectado
* categorías eliminadas del frontend
* permisos conectados
* errores manejados
* loading/empty states implementados
* React Query correctamente invalidado
* sociedad activa respetada
* no existen datos hardcodeados
* frontend compila sin errores TypeScript

# Estado

Documento actualizado Sprint 05.
Backend pendiente de agregado de funcionalidades.
Frontend pendiente.
Integración Back ↔ Front pendiente.