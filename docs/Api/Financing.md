# Canarias System — Financing API

# Objetivo

Documentar el módulo de financiación del sistema.

El módulo es responsable de:

* configuración de tasas base de financiación
* planes de cuotas (cantidad + frecuencia)
* promociones (descuentos o recargos sobre la tasa)

---

# Módulo Backend

```text id="fin-mod"
backend/src/modules/financing/
```

Un único `FinancingService` y un único `FinancingController` gestionan las 3
entidades. Los repositorios de acceso a datos están separados por entidad
(`FinancingConfigRepository`, `FinancingPlanRepository`, `PromotionRepository`).

---

# Endpoint Base

```http id="fin-base"
/api/v1/financing
```

---

# Roles Permitidos

| Rol                | Lectura | Escritura (crear/editar/eliminar) |
| ------------------ | ------- | ---------------------------------- |
| ADMIN               | Sí      | Sí                                  |
| MANAGER              | Sí      | Sí                                  |
| SUPER_ADMIN          | Sí      | Sí                                  |
| Resto de roles autenticados | Sí | No                              |

Todos los endpoints requieren `JwtAuthGuard`, `RolesGuard` y `SocietyGuard`.
El `societyId` se extrae siempre del JWT — nunca se recibe en el body.

---

# FINANCING CONFIGURATION

## Listar

```http id="fin-cfg-list"
GET /financing/configs
```

## Crear

```http id="fin-cfg-create"
POST /financing/configs
```

### Request

```json id="fin-cfg-create-body"
{
  "name": "Financiación Estándar",
  "financingRate": 0.12,
  "isGlobal": true,
  "productIds": []
}
```

* `financingRate`: decimal entre 0 y 1 (0.12 = 12%).
* `productIds`: obligatorio y no vacío si `isGlobal = false`.

## Obtener por ID

```http id="fin-cfg-get"
GET /financing/configs/:id
```

## Actualizar

```http id="fin-cfg-update"
PUT /financing/configs/:id
```

Solo permite modificar `name`, `financingRate`, `isActive`. No permite cambiar
`isGlobal` ni `productIds` (requiere crear una nueva configuración).

## Eliminar

```http id="fin-cfg-delete"
DELETE /financing/configs/:id
```

Responde `400` si existen `FinancingPlan` vinculados a esta configuración.

---

# FINANCING PLAN

## Listar

```http id="fin-plan-list"
GET /financing/plans
```

## Crear

```http id="fin-plan-create"
POST /financing/plans
```

### Request

```json id="fin-plan-create-body"
{
  "name": "3 cuotas mensuales",
  "financingConfigId": "uuid",
  "paymentFrequency": "monthly",
  "installmentsCount": 3,
  "isGlobal": true,
  "productIds": []
}
```

* `paymentFrequency`: `daily` | `weekly` | `biweekly` | `monthly`.
* `financingConfigId` debe pertenecer a la misma sociedad.

## Obtener / Actualizar / Eliminar

```http id="fin-plan-crud"
GET /financing/plans/:id
PUT /financing/plans/:id
DELETE /financing/plans/:id
```

`DELETE` responde `400` si existen `Promotion` o `Sale` vinculadas al plan.

---

# PROMOTION

## Listar

```http id="fin-promo-list"
GET /financing/promotions
```

## Crear

```http id="fin-promo-create"
POST /financing/promotions
```

### Request (vinculada a un plan)

```json id="fin-promo-create-plan"
{
  "name": "Promo agosto",
  "financingPlanId": "uuid",
  "discountPercentage": 0.05
}
```

### Request (independiente)

```json id="fin-promo-create-standalone"
{
  "name": "Promo Black Friday",
  "discountPercentage": 0.10,
  "paymentFrequency": "monthly",
  "installmentsCount": 6,
  "isGlobal": false,
  "productIds": ["uuid-producto-1"]
}
```

* `discountPercentage`: decimal entre -1 y 1. Positivo = descuento al cliente,
  negativo = recargo (ver `Bussines-Rules/Financings.md` BR-FINANCE-016).

## Obtener / Actualizar / Eliminar

```http id="fin-promo-crud"
GET /financing/promotions/:id
PUT /financing/promotions/:id
DELETE /financing/promotions/:id
```

`DELETE` responde `400` si existen `Sale` vinculadas a la promoción.

---

# Manejo de Errores

| Código | Causa                                                          |
| ------ | --------------------------------------------------------------- |
| 400    | Validación de DTO fallida, o borrado bloqueado por FK vinculada |
| 401    | Token ausente o inválido                                        |
| 403    | Rol sin permiso para la operación                                |
| 404    | Recurso inexistente o perteneciente a otra sociedad             |

---

# Seguridad

* JWT obligatorio en todos los endpoints.
* `societyId` siempre resuelto desde el token, nunca desde el body.
* Todas las queries de repositorio incluyen `societyId` en el `WHERE`.

---

# Referencias

* Reglas de negocio: `docs/Bussines-Rules/Financings.md`
* Flujo completo y ejemplos extendidos: `docs/Financiacion/FLUJOS_FINANCIACION.md`
* Entidades y relaciones: `docs/Data-Base/Entities.md`, `docs/Data-Base/Relations.md`

---

# Estado Actual

CRUD completo y operativo para las 3 entidades. Integración con `Sales` (cálculo
real de cuotas usando plan + promoción) pendiente — ver Fase 2 en
`Bussines-Rules/Financings.md`.
