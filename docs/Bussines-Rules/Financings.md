# Flujos de Financiación - Arquitectura y Especificación

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Entidades y Relaciones](#entidades-y-relaciones)
- [Flujo de Creación](#flujo-de-creación)
- [Aislamiento por Sociedad](#aislamiento-por-sociedad)
- [Integración con Ventas](#integración-con-ventas)

---

## Visión General

El módulo de financiación gestiona tres entidades principales que trabajan de manera coordinada:

1. **FinancingConfiguration**: Tasa base de financiación (global o específica por productos)
2. **FinancingPlan**: Esquemas de pago (cuotas + frecuencia)
3. **Promotion**: Ganancias adicionales o descuentos especiales

### Ejemplo de Flujo Real

```
ADMIN crea:
├─ "Financiación Estándar" (12% tasa, global)
│  └─ Aplicable a todos los productos de la sociedad
│
├─ Plan "3 cuotas mensuales" (vinculado a Financiación Estándar)
│  └─ installmentsCount: 3
│  └─ paymentFrequency: "monthly"
│
└─ Promoción "5% de descuento en 6 cuotas" (vinculada al plan)
   └─ discountPercentage: 0.05
   └─ Descuento sobre la tasa base (positivo = descuento, negativo = recargo)
```

---

## Entidades y Relaciones

### FinancingConfiguration

Almacena una tasa de financiación base.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `financingConfigId` | UUID | PK |
| `societyId` | UUID | FK - Aislamiento multi-sociedad |
| `name` | varchar(150) | "Financiación Estándar", "Premium", etc. |
| `financingRate` | decimal(5,4) | Tasa: 0.12 = 12% |
| `isGlobal` | boolean | `true` = aplica a todos los productos |
| `isActive` | boolean | Control de activación |
| `products` | M2M | Productos específicos (si `isGlobal = false`) |
| `createdAt` | timestamp | Auditoría |
| `updatedAt` | timestamp | Auditoría |

**Relación M2M**: `FINANCING_CONFIG_PRODUCTS`
- Registra qué productos aplican esta configuración cuando `isGlobal = false`

### FinancingPlan

Define un esquema de pago (cuotas + frecuencia) vinculado a una FinancingConfiguration.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `financingPlanId` | UUID | PK |
| `societyId` | UUID | FK - Aislamiento multi-sociedad |
| `name` | varchar(150) | "3 cuotas mensuales", "6 semanales", etc. |
| `financingConfigId` | UUID | FK → FinancingConfiguration |
| `paymentFrequency` | enum | `daily`, `weekly`, `biweekly`, `monthly` |
| `installmentsCount` | integer | Cantidad de cuotas (3, 6, 12, etc.) |
| `isGlobal` | boolean | Aplica a todos los productos |
| `isActive` | boolean | Estado |
| `products` | M2M | Productos específicos (si `isGlobal = false`) |
| `promotions` | 1:N | Promociones vinculadas |
| `createdAt` | timestamp | Auditoría |
| `updatedAt` | timestamp | Auditoría |

**Relaciones**:
- **1:N** → `Promotion`: Un plan puede tener múltiples promociones
- **M2M**: `FINANCING_PLAN_PRODUCTS`

### Promotion

Define una ganancia adicional o descuento especial.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `promotionId` | UUID | PK |
| `societyId` | UUID | FK - Aislamiento multi-sociedad |
| `name` | varchar(150) | "5% de descuento en 6 cuotas", "Black Friday", etc. |
| `financingPlanId` | UUID | FK → FinancingPlan (nullable) |
| `plan` | 1:N relation | Carga el plan vinculado |
| `discountPercentage` | decimal(5,4) | Ajuste con signo: positivo = descuento, negativo = recargo (rango -1 a 1) |
| `paymentFrequency` | enum | Frecuencia (si no está vinculada a un plan) |
| `installmentsCount` | integer | Cuotas (si no está vinculada a un plan) |
| `isGlobal` | boolean | Aplica a todos los productos |
| `isActive` | boolean | Estado |
| `products` | M2M | Productos específicos (si `isGlobal = false`) |
| `createdAt` | timestamp | Auditoría |
| `updatedAt` | timestamp | Auditoría |

**Relaciones**:
- **N:1** → `FinancingPlan`: Vinculación opcional a un plan
- **M2M**: `PROMOTION_PRODUCTS`

---

## Flujo de Creación

### Paso 1: Crear Configuración Base

```bash
POST /financing/configs
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Financiación Estándar",
  "financingRate": 0.12,
  "isGlobal": true
}

# Respuesta 201
{
  "financingConfigId": "uuid-1",
  "societyId": "uuid-society",
  "name": "Financiación Estándar",
  "financingRate": 0.12,
  "isGlobal": true,
  "isActive": true,
  "products": [],
  "createdAt": "2026-08-24T10:00:00Z",
  "updatedAt": "2026-08-24T10:00:00Z"
}
```

### Paso 2: Crear Plan Vinculado

```bash
POST /financing/plans
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "3 cuotas mensuales",
  "financingConfigId": "uuid-1",
  "paymentFrequency": "monthly",
  "installmentsCount": 3,
  "isGlobal": true
}

# Respuesta 201
{
  "financingPlanId": "uuid-plan-1",
  "societyId": "uuid-society",
  "name": "3 cuotas mensuales",
  "financingConfigId": "uuid-1",
  "paymentFrequency": "monthly",
  "installmentsCount": 3,
  "isGlobal": true,
  "isActive": true,
  "products": [],
  "promotions": [],
  "createdAt": "2026-08-24T10:05:00Z",
  "updatedAt": "2026-08-24T10:05:00Z"
}
```

### Paso 3: Crear Promoción (Opcional)

```bash
POST /financing/promotions
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "5% de descuento en 6 cuotas",
  "financingPlanId": "uuid-plan-1",
  "discountPercentage": 0.05,
  "isGlobal": true
}

# Respuesta 201
{
  "promotionId": "uuid-promo-1",
  "societyId": "uuid-society",
  "name": "5% de descuento en 6 cuotas",
  "financingPlanId": "uuid-plan-1",
  "plan": { /* objeto FinancingPlan completo */ },
  "discountPercentage": 0.05,
  "paymentFrequency": null,
  "installmentsCount": null,
  "isGlobal": true,
  "isActive": true,
  "products": [],
  "createdAt": "2026-08-24T10:10:00Z",
  "updatedAt": "2026-08-24T10:10:00Z"
}
```

---

## Aislamiento por Sociedad

### Garantía de Seguridad

Todos los métodos de consulta/actualización/eliminación validan que el `societyId` coincida con el usuario autenticado:

```typescript
// Backend - Validación en Repository

async findById(societyId: string, financingConfigId: string) {
  return this.repo.findOne({
    where: {
      societyId,           // ← Siempre requerido
      financingConfigId,
    },
    relations: ['products'],
  });
}
```

### Flujo de Autenticación

```
JWT (Token)
    ↓
CurrentUser() decorator
    ↓
user.societyId extraído
    ↓
Pasado a Service
    ↓
Validado en Repository
    ↓
WHERE society_id = ? AND ...
    ↓
Respuesta segura (solo datos de esa sociedad)
```

### Prevención de Ataques

**❌ NO permitido (sin societyId)**:
```
GET /financing/configs/uuid → Error 403 (falta societyId en query)
```

**✅ Permitido**:
```
GET /financing/configs → Devuelve solo los de la sociedad del usuario
```

---

## Integración con Ventas

### Caso de Uso: Cliente selecciona plan en checkout

1. **Frontend**:
   ```typescript
   // Usuario selecciona 6 cuotas mensuales
   const plan = await getFinancingPlanById("uuid-plan-1");
   // plan.installmentsCount = 6
   // plan.paymentFrequency = "monthly"
   ```

2. **Envío a Backend (crear venta)**:
   ```json
   {
     "productIds": ["prod-1", "prod-2"],
     "financingPlanId": "uuid-plan-1",
     "installmentCount": 6,
     "paymentFrequency": "monthly"
   }
   ```

3. **Backend (Sales Service)**:
   ```typescript
   // Resuelve la financiación aplicable
   const plan = await financingService.getFinancingPlanById(
     societyId,
     financingPlanId
   );
   
   // Obtiene configuración base
   const config = await financingService.getFinancingConfigurationById(
     societyId,
     plan.financingConfigId
   );
   
   // Calcula tasa total
   const baseRate = config.financingRate; // 0.12 = 12%
   const discount = promotion?.discountPercentage ?? 0; // 0.05 = -5% sobre la tasa
   const totalRate = baseRate - discount; // 0.07 = 7%
   
   // Genera cuotas con la estructura
   const installments = generateInstallments(
     totalAmount,
     plan.installmentsCount,
     plan.paymentFrequency,
     totalRate
   );
   ```

4. **Estructura de Cuota Generada**:
   ```typescript
   interface Installment {
     sequenceNumber: 1,
     amount: 100.50,        // calculado con tasa total
     dueDate: "2026-09-24", // basado en paymentFrequency
     financingPlanId: "uuid-plan-1",
     promotionId: "uuid-promo-1" | null,
   }
   ```

---

## DTOs y Validaciones

### CreateFinancingConfigDto

```typescript
{
  name: string;                    // Requerido: "Financiación Estándar"
  financingRate: number;           // Requerido: 0.12
  isGlobal?: boolean;              // Opcional: default true
  productIds?: string[];           // Requerido si isGlobal = false
}
```

### CreateFinancingPlanDto

```typescript
{
  name: string;                    // Requerido
  financingConfigId: string;       // Requerido (UUID)
  paymentFrequency: PaymentFrequency; // Requerido
  installmentsCount: number;       // Requerido (≥ 1)
  isGlobal?: boolean;              // Opcional: default true
  productIds?: string[];           // Requerido si isGlobal = false
}
```

### CreatePromotionDto

```typescript
{
  name: string;                    // Requerido
  financingPlanId?: string | null; // Opcional
  discountPercentage?: number;      // Opcional. Positivo = descuento, negativo = recargo
  paymentFrequency?: PaymentFrequency; // Opcional
  installmentsCount?: number;      // Opcional
  isGlobal?: boolean;              // Opcional: default false
  productIds?: string[];           // Requerido si isGlobal = false
}
```

---

## Consideraciones de Escalabilidad

### ✅ Ventajas del Diseño

1. **Separación de Responsabilidades**:
   - Configuración = tasa base
   - Plan = estructura de pagos
   - Promoción = modificaciones especiales

2. **Reutilización**:
   - Una configuración puede usarse en múltiples planes
   - Un plan puede vincularse a múltiples promociones
   - Promociones independientes del plan

3. **Flexibilidad**:
   - Aplicar a todo (global) o a productos específicos
   - Modificar una configuración afecta a todos sus planes
   - Desactivar sin eliminar

4. **Auditoría**:
   - Todos los cambios registrados con `updatedAt`
   - `societyId` registrado en cada entidad
   - Rastreo de decisiones comerciales

### 📊 Limites Sugeridos (por productividad)

- Máximo 5-10 configuraciones por sociedad
- Máximo 20-30 planes por sociedad
- Máximo 50 promociones activas por sociedad

Si excedes estos límites, considera:
- Archivado periódico de datos inactivos
- Paginación en listados
- Índices en `societyId`, `isActive`

---

## Errores Comunes y Soluciones

### Error 1: "Falta societyId"

**Causa**: Frontend envía `societyId` en el payload (MAL).

**Solución**: El backend obtiene `societyId` del JWT.

```typescript
// ❌ MALO
POST /financing/configs
{ "societyId": "uuid", "name": "..." }

// ✅ CORRECTO
POST /financing/configs
{ "name": "..." }
// Backend extrae societyId del JWT
```

### Error 2: "No encontrado o sin acceso"

**Causa**: Usuario de Sociedad A intenta acceder a datos de Sociedad B.

**Solución**: Repository valida `societyId` en la query WHERE.

```typescript
// Repository siempre filtra por societyId
where: { societyId: 'A', financingConfigId: 'uuid-from-B' }
// Resultado: null (seguro, no expone existencia)
```

### Error 3: "No se puede eliminar: tiene X vinculados"

**Causa**: Intentar eliminar una configuración/plan/promoción que tiene registros
dependientes (FK `ON DELETE RESTRICT`).

**Solución implementada**: `FinancingService` captura la violación de clave
foránea de Postgres (código `23503`) y la traduce en un `400 Bad Request` con
mensaje claro, en vez de dejar pasar un `500`:

```typescript
// FinancingService.deleteConfig / deletePlan / deletePromotion
try {
  await this.configRepo.delete(societyId, financingConfigId);
} catch (error) {
  if (error instanceof QueryFailedError && (error as any).code === '23503') {
    throw new BadRequestException(
      'No se puede eliminar: esta configuración tiene planes de financiación vinculados.',
    );
  }
  throw error;
}
```

---

## Estado Actual (2026-08-25)

✅ Completado:

1. **FinancingService** y **FinancingController** únicos (módulo `financing`)
2. Repositorios separados por entidad (Config / Plan / Promotion)
3. **Endpoints REST** completos para las 3 entidades
4. **Frontend**: forms de create/edit para las 3 entidades con validación y alertas del sistema (`ConfirmDialog`)
5. Manejo de errores de FK en borrado (400 con mensaje claro)
6. Campo `discountPercentage` con signo (descuento/recargo)

🔴 Pendiente (Fase 2):

1. **Integración en Sales**: `SalesService.createSale()` resuelva `FinancingPlan` + `FinancingConfiguration` + `Promotion` en vez de usar la tasa fija temporal (12%)
2. Generación real de cuotas a partir del plan seleccionado

---

## Contacto y Cambios

Esta documentación es viva y se actualiza conforme evoluciona el sistema.

Último update: 2026-08-25
