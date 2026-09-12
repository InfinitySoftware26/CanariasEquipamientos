# Canarias System — Products API

# Objetivo

Documentar el módulo de productos del sistema.

El módulo será responsable de:

* gestión productos
* precios
* categorías
* financiación
* configuración comercial
* proveedores
* control disponibilidad

---

# Endpoint Base

```http id="41b1p0"
/api/v1/products
```

---

# Roles Permitidos

| Rol     | Acceso   |
| ------- | -------- |
| ADMIN   | Completo |
| SELLER  | Lectura  |
| MANAGER | Lectura  |

---

# Estados Producto

| Estado       | Descripción   |
| ------------ | ------------- |
| ACTIVE       | Disponible    |
| INACTIVE     | Inactivo      |
| DISCONTINUED | Descontinuado |

---

# Endpoints

---

# Crear Producto

## Endpoint

```http id="34cbg5"
POST /products
```

---

# Roles

* ADMIN

---

# Request

```json id="q5sgrn"
{
  "name": "Smart TV Samsung 50",
  "category": "TV",
  "price": 450000,
  "supplierId": "uuid",
  "hasStockControl": false
}
```

---

# Regla Financiera

La financiación **ya no se asigna directamente al producto** (no existe un campo
`financingConfigurationId` en `Product`). En su lugar, el producto puede formar
parte de la relación M2M `FINANCING_CONFIG_PRODUCTS` / `FINANCING_PLAN_PRODUCTS` /
`PROMOTION_PRODUCTS` cuando una `FinancingConfiguration`, `FinancingPlan` o
`Promotion` se crea con `isGlobal = false`.

## Configuración Global (por defecto)

Si una `FinancingConfiguration` tiene `isGlobal = true`, aplica automáticamente a
todos los productos de la sociedad sin necesidad de asociación explícita.

## Configuración Específica por Producto

Si `isGlobal = false`, la configuración/plan/promoción solo aplica a los
`productIds` explícitamente asociados en su creación o edición.

Ver detalle completo en `docs/Api/Financing.md` y `docs/Bussines-Rules/Financings.md`.

---

# Regla Operativa Stock

Los productos de:

* Canarias 1
* Canarias 2
* Canarias Motos

podrán operar sin control obligatorio stock.

---

# Response Success

```json id="6zsr76"
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "uuid"
  }
}
```

---

# Obtener Productos

## Endpoint

```http id="4tqv0r"
GET /products
```

---

# Query Params

| Parámetro  | Tipo   |
| ---------- | ------ |
| page       | number |
| limit      | number |
| category   | string |
| status     | string |
| supplierId | uuid   |

---

# Obtener Producto

## Endpoint

```http id="hqqr1y"
GET /products/:id
```

---

# Información Incluida

* proveedor
* financiación
* historial ventas
* stock actual
* precio
* estado

---

# Actualizar Producto

## Endpoint

```http id="bkm9hy"
PATCH /products/:id
```

---

# Reglas Negocio

* productos vendidos no deberán eliminarse
* implementar soft delete
* productos podrán cambiar financiación
* precios deberán auditarse

---

# Auditoría

Registrar:

* creador producto
* cambios precio
* cambios financiación
* cambios estado

---

# Seguridad

* JWT obligatorio
* permisos ADMIN

---

# Escalabilidad Futura

Preparado para:

* múltiples precios
* promociones
* variantes
* imágenes
* ecommerce
* catálogo mobile

---

# Estado Actual

Módulo aprobado para Fase 1.
