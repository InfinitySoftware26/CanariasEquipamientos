# Integración Backend → Frontend — Sprint 02

Base URL: `https://canarias-backend.onrender.com/api/v1`  
Todos los endpoints requieren `Authorization: Bearer <accessToken>` excepto `/auth/login` y `/auth/refresh`.

---

## AUTH

### POST /auth/login
Autentica al usuario y devuelve el token más las sociedades a las que pertenece.

**Body**
```json
{ "email": "admin@empresa.com", "password": "secreto123" }
```

**Respuesta**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "staffId": "uuid",
    "name": "Juan Pérez",
    "email": "admin@empresa.com",
    "role": "admin",
    "societyId": "uuid-sociedad-primaria",
    "societies": [
      { "societyId": "uuid", "societyName": "Canarias SA", "status": "active" }
    ]
  }
}
```

> `societies` contiene todas las sociedades activas del usuario. El frontend puede permitir al usuario elegir con cuál operar y guardar el `societyId` seleccionado en el estado global.

### POST /auth/refresh
Renueva el accessToken usando el refreshToken.

**Body**
```json
{ "refreshToken": "eyJ..." }
```

**Respuesta**
```json
{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }
```

---

## PRODUCTOS

### GET /products
Lista los productos activos de la sociedad del usuario autenticado.

**Respuesta**
```json
[
  {
    "productId": "uuid",
    "name": "Heladera No Frost",
    "brand": "Samsung",
    "model": "RT32K5730S8",
    "category": "Electrodomésticos",
    "description": null,
    "price": "480000.00",
    "costPrice": "340000.00",
    "societyId": "uuid",
    "status": "active",
    "createdAt": "2026-06-13T10:00:00Z",
    "updatedAt": "2026-06-13T10:00:00Z"
  }
]
```

### GET /products/:id
Obtiene un producto por ID.

**Respuesta** → mismo objeto del listado.

### POST /products
Crea un nuevo producto. Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Body**
```json
{
  "name": "Heladera No Frost",
  "brand": "Samsung",
  "model": "RT32K5730S8",
  "category": "Electrodomésticos",
  "description": "Opcional",
  "price": 480000,
  "costPrice": 340000
}
```

**Respuesta** → objeto producto creado (201).

### PATCH /products/:id
Actualiza campos del producto. Todos los campos son opcionales.

**Body** → mismos campos que POST, todos opcionales.

**Respuesta** → objeto producto actualizado.

### DELETE /products/:id
Desactiva un producto (soft delete). Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Respuesta** → 204 No Content.

---

## CONFIGURACIÓN DE FINANCIACIÓN

### GET /financing-config
Obtiene la configuración de tasas de interés de la sociedad. Si no existe, devuelve valores por defecto.

**Respuesta**
```json
{
  "financingConfigId": "uuid",
  "societyId": "uuid",
  "installments3Rate": "0.1500",
  "installments6Rate": "0.2500",
  "installments9Rate": "0.3500",
  "isActive": true,
  "createdAt": "2026-06-13T10:00:00Z",
  "updatedAt": "2026-06-13T10:00:00Z"
}
```

> Las tasas representan el porcentaje de interés total sobre el monto. Ejemplo: rate 0.15 → el cliente paga `precio × 1.15` dividido en N cuotas.

### PUT /financing-config
Actualiza las tasas. Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Body** (todos opcionales)
```json
{
  "installments3Rate": 0.10,
  "installments6Rate": 0.20,
  "installments9Rate": 0.30
}
```

**Respuesta** → objeto de configuración actualizado.

---

## VENTAS

### Ciclo de vida de una venta

```
PENDING_ADMIN_VALIDATION
  ├── [aprobar] → PENDING_ENVIRONMENTAL_VISIT
  │     ├── [aprobar] → PENDING_DELIVERY
  │     │     ├── [entregar] → DELIVERED → CLOSED
  │     │     └── [falla entrega] → sigue en PENDING_DELIVERY (se registra intento)
  │     └── [rechazar] → ENVIRONMENTAL_REJECTED
  └── [rechazar] → REJECTED_ADMIN
```

### GET /sales
Lista todas las ventas de la sociedad. Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Respuesta**
```json
[
  {
    "saleId": "uuid",
    "clientId": "uuid",
    "staffId": "uuid",
    "societyId": "uuid",
    "totalAmount": "480000.00",
    "installmentAmount": "184000.00",
    "installmentsCount": 3,
    "paymentFrequency": "monthly",
    "firstDueDate": "2026-07-01",
    "saleDate": "2026-06-13T10:00:00Z",
    "status": "pending_admin_validation",
    "assignedCollectorId": null,
    "observation": null,
    "createdAt": "2026-06-13T10:00:00Z",
    "updatedAt": "2026-06-13T10:00:00Z"
  }
]
```

### GET /sales/pending
Ventas esperando validación administrativa. Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Respuesta** → array igual al anterior.

### GET /sales/my
Ventas cargadas por el vendedor autenticado. Rol: SELLER.

**Respuesta** → array igual al anterior.

### GET /sales/collector
Ventas asignadas al collector autenticado. Rol: COLLECTOR.

**Respuesta** → array igual al anterior.

### GET /sales/:id
Detalle de una venta por ID.

**Respuesta** → objeto único igual al listado.

### GET /sales/:id/history
Historial completo de actividad de la venta.

**Respuesta**
```json
[
  {
    "id": "uuid",
    "saleId": "uuid",
    "action": "SALE_CREATED",
    "snapshot": { "...": "datos al momento de la acción" },
    "performedBy": "uuid-staff",
    "performedByName": "admin@empresa.com",
    "performedAt": "2026-06-13T10:00:00Z"
  }
]
```

Acciones posibles: `SALE_CREATED`, `ADMIN_APPROVED`, `ADMIN_REJECTED`, `ENV_VISIT_APPROVED`, `ENV_VISIT_REJECTED`, `DELIVERED`, `DELIVERY_FAILED`, `SALE_CLOSED`, `COLLECTOR_REASSIGNED`.

### GET /sales/:id/validations
Validaciones registradas (admin y ambiental). Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Respuesta**
```json
[
  {
    "validationId": "uuid",
    "saleId": "uuid",
    "staffId": "uuid",
    "step": "admin_validation",
    "status": "approved",
    "observations": null,
    "validatedAt": "2026-06-13T10:05:00Z",
    "createdAt": "2026-06-13T10:05:00Z"
  }
]
```

### GET /sales/:id/delivery-attempts
Intentos de entrega fallidos. Roles: ADMIN, MANAGER, COLLECTOR.

**Respuesta**
```json
[
  {
    "deliveryAttemptId": "uuid",
    "saleId": "uuid",
    "staffId": "uuid",
    "attemptNumber": 1,
    "reason": "No había nadie en el domicilio",
    "attemptedAt": "2026-06-15T14:00:00Z",
    "createdAt": "2026-06-15T14:00:00Z"
  }
]
```

### POST /sales
Crea una nueva venta. Roles: SELLER, ADMIN, MANAGER.

**Body**
```json
{
  "clientId": "uuid-cliente",
  "saleDate": "2026-06-13T10:00:00Z",
  "installmentsCount": 6,
  "paymentFrequency": "monthly",
  "firstDueDate": "2026-07-01",
  "observation": "Opcional",
  "products": [
    {
      "productId": "uuid-producto",
      "quantity": 1,
      "unitPrice": 480000
    }
  ]
}
```

> `installmentsCount`: solo `3`, `6` o `9`.  
> `paymentFrequency`: `"weekly"` o `"monthly"`.  
> `firstDueDate`: fecha en formato `YYYY-MM-DD`.  
> El backend calcula `totalAmount`, aplica la tasa de interés configurada y genera automáticamente las cuotas.

**Respuesta** → objeto venta creada (201).

### PATCH /sales/:id/admin-validate
Validación administrativa. Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Body**
```json
{ "status": "approved", "observations": "Documentación verificada" }
```
o
```json
{ "status": "rejected", "observations": "Ingresos insuficientes" }
```

**Respuesta** → 204 No Content.

### PATCH /sales/:id/env-validate
Validación de visita ambiental. Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Body** → mismo formato que admin-validate.

**Respuesta** → 204 No Content.

### PATCH /sales/:id/deliver
Marca la venta como entregada. Roles: COLLECTOR, ADMIN, MANAGER.

**Body** → vacío `{}`.

**Respuesta** → 204 No Content.

### PATCH /sales/:id/fail-delivery
Registra un intento de entrega fallido (la venta queda en `PENDING_DELIVERY`). Roles: COLLECTOR, ADMIN, MANAGER.

**Body**
```json
{ "reason": "El cliente no estaba en su domicilio" }
```

**Respuesta** → 204 No Content.

### PATCH /sales/:id/close
Cierra la venta luego de la entrega. Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Body** → vacío `{}`.

**Respuesta** → 204 No Content.

### PATCH /sales/:id/assign-collector
Asigna o reasigna un collector. Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Body**
```json
{ "collectorId": "uuid-collector" }
```

**Respuesta** → 204 No Content.

---

## CUOTAS

### GET /installments/sale/:saleId
Lista las cuotas de una venta, ordenadas por número de cuota.

**Respuesta**
```json
[
  {
    "installmentId": "uuid",
    "saleId": "uuid",
    "clientId": "uuid",
    "societyId": "uuid",
    "installmentNumber": 1,
    "amount": "184000.00",
    "paidAmount": "0.00",
    "remainingAmount": "184000.00",
    "dueDate": "2026-07-01",
    "paymentFrequency": "monthly",
    "status": "pending",
    "notes": null,
    "createdAt": "2026-06-13T10:00:00Z",
    "updatedAt": "2026-06-13T10:00:00Z"
  }
]
```

Estados posibles: `pending`, `paid`, `overdue`, `partial`, `defaulted`.

### GET /installments/client/:clientId
Lista todas las cuotas de un cliente en la sociedad. Roles: ADMIN, MANAGER, COLLECTOR.

**Respuesta** → array igual al anterior.

### GET /installments/overdue
Lista cuotas vencidas de la sociedad. Roles: ADMIN, MANAGER, COLLECTOR.

**Respuesta** → array igual al anterior.

### PATCH /installments/:id/pay
Registra un pago sobre una cuota. Si el monto cubre el total, pasa a `paid`; si es parcial, pasa a `partial`. Roles: ADMIN, MANAGER, COLLECTOR.

**Body**
```json
{ "amount": 184000 }
```

**Respuesta** → 204 No Content.

---

## ZONAS

### GET /zones
Lista las zonas activas de la sociedad. Roles: todos.

**Respuesta**
```json
[
  {
    "zoneId": "uuid",
    "societyId": "uuid",
    "name": "Zona Norte",
    "description": "Sector norte de la ciudad",
    "status": "active",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### GET /zones/:id
Obtiene una zona por ID.

### POST /zones
Crea una zona. Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Body**
```json
{ "name": "Zona Norte", "description": "Opcional" }
```

### PATCH /zones/:id
Actualiza una zona.

**Body** → campos opcionales: `name`, `description`, `status` (`"active"` o `"inactive"`).

### DELETE /zones/:id
Desactiva una zona (soft delete). Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Respuesta** → 204 No Content.

### GET /zones/:id/staff
Lista el personal asignado a una zona.

**Respuesta**
```json
[
  {
    "staffId": "uuid",
    "name": "Carlos López",
    "email": "carlos@empresa.com",
    "role": "collector",
    "status": "active",
    "assignedAt": "..."
  }
]
```

### POST /zones/:id/staff
Asigna un SELLER o COLLECTOR a una zona. Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Body**
```json
{ "staffId": "uuid", "status": "active" }
```

**Respuesta** → 204 No Content.

---

## SOCIEDADES

### GET /societies
Lista todas las sociedades. Rol: SUPER_ADMIN.

### GET /societies/:id
Detalle de una sociedad.

### GET /societies/:id/staff
Lista el personal de una sociedad.

### POST /societies/:id/staff
Asigna un empleado a una sociedad. Roles: SUPER_ADMIN, MANAGER.

**Body**
```json
{ "staffId": "uuid", "status": "active" }
```

---

## NOTAS PARA EL FRONTEND

**Enums útiles:**

```
paymentFrequency: "weekly" | "monthly"
installmentsCount: 3 | 6 | 9
saleStatus: "pending_admin_validation" | "rejected_admin" | "pending_environmental_visit" | "environmental_rejected" | "pending_delivery" | "delivered" | "closed"
installmentStatus: "pending" | "paid" | "overdue" | "partial" | "defaulted"
productStatus: "active" | "inactive"
staffRole: "super_admin" | "manager" | "admin" | "seller" | "collector"
```

**Flujo de creación de venta (formulario):**
1. Seleccionar cliente (UUID del cliente)
2. Seleccionar productos (uno o más, con cantidad y precio)
3. Elegir cantidad de cuotas: 3, 6 o 9
4. Elegir frecuencia: semanal o mensual
5. Ingresar fecha primer vencimiento
6. (Opcional) observaciones

El backend calcula el total, aplica la tasa y genera las cuotas automáticamente.

**Cálculo de cuota (para preview en frontend):**
```
totalAmount = suma(unitPrice × quantity)
rate = según cuotas (obtener de GET /financing-config)
totalConInterés = totalAmount × (1 + rate)
montoXCuota = totalConInterés / cantidadCuotas
```
