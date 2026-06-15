# Integración Backend → Frontend — Sprint 02

Base URL: `https://canarias-backend.onrender.com/api/v1`  
Todos los endpoints requieren `Authorization: Bearer <accessToken>` excepto `/auth/login`, `/auth/refresh` y `/auth/select-society` (este último sí requiere el token inicial del login).

---

## AUTH

### Flujo de autenticación completo

```
Usuario ingresa email + contraseña
        │
        ▼
POST /auth/login
  ├── 401 → "Credenciales inválidas" (mostrar error en formulario)
  └── 200 → { accessToken, user: { societies: [...], societyId: null } }
              │
              ├── societies.length === 0
              │     └── Mostrar: "No estás registrado en ninguna sociedad"
              │
              └── societies.length >= 1
                    └── Mostrar selector de sociedad (dropdown / cards)
                              │
                              ▼ (usuario elige)
                    POST /auth/select-society { societyId }
                      ├── 403 → "No tenés acceso a esta sociedad"
                      └── 200 → { accessToken (con societyId), societyId }
                                    │
                                    ▼
                          Reemplazar accessToken en estado global
                          Redirigir al dashboard
                          (todos los requests siguientes filtran por sociedad)
```

---

### POST /auth/login
Autentica con email y contraseña. Devuelve un token inicial (sin sociedad seleccionada) y la lista de sociedades del usuario.

**Body**
```json
{ "email": "admin@empresa.com", "password": "secreto123" }
```

**Respuesta 200**
```json
{
  "accessToken": "eyJ...",
  "user": {
    "staffId": "uuid",
    "name": "Juan Pérez",
    "email": "admin@empresa.com",
    "role": "administrativo",
    "societyId": null,
    "societies": [
      { "societyId": "uuid-1", "societyName": "Canarias Norte", "status": "active" },
      { "societyId": "uuid-2", "societyName": "Canarias Sur",   "status": "active" }
    ]
  }
}
```

> **Importante:** `societyId` es `null` hasta que el usuario seleccione una sociedad con `/auth/select-society`. El `accessToken` devuelto aquí **no puede usarse** para consultar datos de negocio — solo sirve para llamar a `/auth/select-society`.  
> Si `societies` está vacío, el usuario no tiene acceso a ninguna sociedad y debe mostrarse un mensaje de error.

**Respuesta 401**
```json
{ "statusCode": 401, "message": "Credenciales invalidas" }
```

---

### POST /auth/select-society
Valida que el usuario pertenezca a la sociedad solicitada y emite un nuevo JWT con el `societyId` embebido. A partir de este token, todos los endpoints de negocio filtran datos por esa sociedad.

**Requiere:** `Authorization: Bearer <accessToken>` (el del login)

**Body**
```json
{ "societyId": "uuid-sociedad" }
```

**Respuesta 200**
```json
{
  "accessToken": "eyJ...",
  "societyId": "uuid-sociedad"
}
```

> El frontend debe **reemplazar** el `accessToken` guardado en el estado global con este nuevo token. También actualiza la cookie del `refresh_token` (HttpOnly) con el `societyId` seleccionado, de modo que los refrescos automáticos preserven la sociedad elegida.

**Respuesta 400** — usuario sin sociedades vinculadas:
```json
{ "statusCode": 400, "message": "No estás registrado en ninguna sociedad" }
```

**Respuesta 403** — la sociedad no pertenece al usuario:
```json
{ "statusCode": 403, "message": "No tenés acceso a esta sociedad" }
```

---

### POST /auth/refresh
Renueva el accessToken usando el refreshToken almacenado en la cookie HttpOnly. Preserva el `societyId` ya seleccionado.

**Requiere:** cookie `refresh_token` (se envía automáticamente por el browser).

**Respuesta 200**
```json
{ "accessToken": "eyJ..." }
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

## STAFF

### Flujo de registro de empleado con autocompletado

```
Usuario ingresa DNI o email en el formulario
        │
        ▼ (debounce ~400ms)
GET /staff/lookup?dni=... o ?email=...
  ├── 404 → empleado no existe → formulario vacío, completar manualmente
  └── 200 → { ...datos, alreadyInCurrentSociety }
              │
              ├── alreadyInCurrentSociety: true
              │     └── Mostrar aviso: "Ya pertenece a esta sociedad"
              │         Podés mostrar su ficha o redirigir
              │
              └── alreadyInCurrentSociety: false
                    └── Pre-llenar formulario con name, email, phone
                        Usuario confirma y completa password + rol
                        │
                        ▼
                POST /staff → nuevo empleado creado y
                              vinculado automáticamente a la sociedad de sesión
```

> **Comportamiento de scope:** MANAGER y ADMIN solo pueden crear staff en **su propia sociedad de sesión** (el backend ignora cualquier `societyId` que se envíe en el body). Solo SUPER_ADMIN puede elegir la sociedad destino.

---

### GET /staff/lookup
Busca un empleado por DNI o email para autocompletar el formulario de registro. No verifica si ya existe en la sociedad actual — devuelve esa info en el campo `alreadyInCurrentSociety`.

**Roles:** SUPER_ADMIN, MANAGER, ADMIN  
**Query params:** `?email=...` o `?dni=...` (uno de los dos)

**Respuesta 200**
```json
{
  "staffId": "uuid",
  "name": "Juan Pérez",
  "dni": "30123456",
  "email": "juan@empresa.com",
  "role": "vendedor",
  "phone": "351-555-0001",
  "isActive": true,
  "alreadyInCurrentSociety": false
}
```

**Respuesta 404** — no existe ningún empleado con ese dato.

---

### GET /staff
Lista los empleados activos de la sociedad de la sesión.

**Roles:** SUPER_ADMIN, MANAGER, ADMIN

**Respuesta**
```json
[
  {
    "staffId": "uuid",
    "name": "Juan Pérez",
    "dni": "30123456",
    "email": "juan@empresa.com",
    "role": "vendedor",
    "societyId": "uuid",
    "phone": null,
    "isActive": true,
    "createdAt": "2026-06-13T10:00:00Z",
    "updatedAt": "2026-06-13T10:00:00Z"
  }
]
```

### GET /staff/me
Perfil del empleado autenticado. Roles: todos.

**Respuesta** → objeto igual al listado.

### GET /staff/:id
Obtiene un empleado por ID. Roles: SUPER_ADMIN, MANAGER, ADMIN.

**Respuesta** → objeto igual al listado.

### POST /staff
Crea un nuevo empleado. Lo vincula automáticamente a la sociedad de la sesión en `STAFF_SOCIETIES`.

**Roles:** SUPER_ADMIN, MANAGER, ADMIN  
> MANAGER puede crear: ADMIN, SELLER, COLLECTOR  
> ADMIN puede crear: SELLER, COLLECTOR

**Body**
```json
{
  "name": "Juan Pérez",
  "dni": "30123456",
  "email": "juan@empresa.com",
  "password": "Password123!",
  "role": "vendedor",
  "societyId": "uuid"
}
```

> `societyId` en el body solo aplica si el creador es SUPER_ADMIN. Para MANAGER y ADMIN, el backend usa siempre la sociedad de la sesión actual e ignora este campo.

**Respuesta** → objeto empleado creado (201).  
**409** → DNI o email ya registrado.  
**403** → sin permiso para crear ese rol.

### POST /staff/super-admin
Crea otro SUPER_ADMIN. Rol: SUPER_ADMIN exclusivamente.

**Body** → mismo que POST /staff más `societyId` opcional.

### PATCH /staff/:id
Actualiza datos del empleado. Roles: el propio usuario para datos personales; MANAGER/SUPER_ADMIN para rol e isActive.

**Body** (todos opcionales)
```json
{ "name": "...", "phone": "...", "role": "...", "isActive": true }
```

### PATCH /staff/:id/password
Cambia la contraseña. Solo el propio usuario puede cambiarla.

**Body**
```json
{ "currentPassword": "...", "newPassword": "NuevaPass123!" }
```

### DELETE /staff/:id
Desactiva un empleado (soft delete). Roles: SUPER_ADMIN, MANAGER.

**Respuesta** → 204 No Content.

---

## CLIENTES

### Flujo de precarga con autocompletado

```
Usuario (SELLER/ADMIN/MANAGER) ingresa DNI en el formulario
        │
        ▼ (debounce ~400ms)
GET /clients/lookup?documentNumber=...
  ├── 404 → cliente no existe → formulario vacío, completar manualmente
  └── 200 → { ...datos, alreadyInCurrentSociety }
              │
              ├── alreadyInCurrentSociety: true
              │     └── Cliente ya está en esta sociedad
              │         Mostrar aviso + opción de ver su ficha (GET /clients/:id)
              │
              └── alreadyInCurrentSociety: false
                    └── Viene de otra sociedad o es nuevo
                        Pre-llenar: name, surname, address, phone, email
                        Usuario confirma datos
                        │
                        ▼
                POST /clients/preload → cliente registrado en la sociedad actual
```

---

### GET /clients/lookup
Busca un cliente por número de documento o email para autocompletar el formulario de precarga.

**Roles:** SELLER, ADMIN, MANAGER, SUPER_ADMIN  
**Query params:** `?documentNumber=...` o `?email=...` (uno de los dos)

**Respuesta 200**
```json
{
  "clientId": "uuid",
  "name": "María",
  "surname": "García",
  "documentNumber": "28456789",
  "address": "Av. Libertad 123",
  "phone": "351-555-0001",
  "email": "maria@email.com",
  "societyId": "uuid-otra-sociedad",
  "alreadyInCurrentSociety": false
}
```

**Respuesta 404** — no existe cliente con ese dato.

---

### POST /clients/preload
Registra un nuevo cliente en la sociedad de la sesión. Roles: SELLER, ADMIN, MANAGER, SUPER_ADMIN.

**Body**
```json
{
  "name": "María",
  "surname": "García",
  "documentNumber": "28456789",
  "address": "Av. Libertad 123",
  "phone": "351-555-0001",
  "email": "maria@email.com",
  "supportDni": true,
  "supportBill": false,
  "supportVisit": false,
  "observations": "Opcional"
}
```

**Respuesta** → objeto cliente creado (201).

### GET /clients
Lista clientes con paginación y filtro por nombre. Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Query params:** `?page=1&perPage=20&name=García`

**Respuesta**
```json
{
  "items": [ { "clientId": "uuid", "name": "María", "surname": "García", "..." : "..." } ],
  "total": 45,
  "page": 1,
  "perPage": 20
}
```

### GET /clients/:id
Obtiene un cliente por ID. Roles: SELLER, ADMIN, MANAGER, SUPER_ADMIN.

**Respuesta** → objeto cliente completo.

### PATCH /clients/:id
Actualiza datos de un cliente. Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Body** → mismos campos que preload, todos opcionales.

### GET /clients/:id/history
Historial de cambios del cliente. Roles: ADMIN, MANAGER, SUPER_ADMIN.

**Respuesta**
```json
[
  {
    "action": "create",
    "snapshot": { "...": "estado completo del cliente en ese momento" },
    "performedBy": "uuid-staff",
    "performedByName": "vendedor@empresa.com",
    "performedAt": "2026-06-13T10:00:00Z"
  }
]
```

Acciones posibles: `create`, `update`, `request_verification`.

### POST /clients/:id/request-verification
Solicita verificación de los datos del cliente. Roles: SELLER, ADMIN, MANAGER, SUPER_ADMIN.

**Body**
```json
{ "note": "Opcional — motivo o aclaración" }
```

**Respuesta** → objeto cliente actualizado.

---

## SOCIEDADES

### GET /societies
Lista todas las sociedades. Roles: SUPER_ADMIN, MANAGER, ADMIN.

### GET /societies/:id
Detalle de una sociedad. Roles: SUPER_ADMIN, MANAGER, ADMIN.

### GET /societies/:id/staff
Lista el personal vinculado a una sociedad. Roles: SUPER_ADMIN, MANAGER, ADMIN.

### POST /societies/:id/staff
Vincula un empleado existente a una sociedad. Roles: SUPER_ADMIN, MANAGER.

> **Restricción:** MANAGER solo puede asignar staff a **su propia sociedad de sesión**. Intentar asignar a otra sociedad devuelve `403`. SUPER_ADMIN puede asignar a cualquiera.

**Body**
```json
{ "staffId": "uuid", "status": "active" }
```

**Respuesta** → 204 No Content.  
**403** → MANAGER intentó asignar a una sociedad que no es la suya.

---

## NOTAS PARA EL FRONTEND

**Flujo de autenticación y selección de sociedad:**

```
1. POST /auth/login
   → guardar accessToken inicial en memoria (no en localStorage)
   → si societies.length === 0: mostrar "Sin acceso" y bloquear navegación
   → si societies.length >= 1: redirigir a pantalla de selección de sociedad

2. Usuario elige sociedad → POST /auth/select-society { societyId }
   → reemplazar accessToken con el nuevo
   → guardar societyId y societyName en estado global (para mostrar en UI)
   → redirigir al dashboard

3. Todos los requests siguientes usan el nuevo accessToken
   → el backend ya filtra por la sociedad embebida en el JWT

4. Al expirar el token → POST /auth/refresh
   → el nuevo accessToken conserva el societyId seleccionado

5. Logout → POST /auth/logout + limpiar estado global
```

> El `societyId` del token post-selección es el que el backend usa para aislar los datos. El frontend **no necesita** enviar el societyId en los requests — ya viene en el JWT.

---

**Patrón de autocompletado (staff y clientes):**

Tanto el lookup de staff como el de clientes devuelven `alreadyInCurrentSociety`. El frontend debe usar este campo para distinguir tres casos:

| Resultado lookup | `alreadyInCurrentSociety` | Acción sugerida |
|---|---|---|
| 404 | — | Formulario vacío, el usuario completa todo |
| 200 | `false` | Pre-llenar campos, el usuario confirma y registra |
| 200 | `true` | Aviso "ya registrado en esta sociedad" + link a la ficha |

Implementación recomendada con debounce:
```
onChange(dni) {
  if (dni.length < 7) return;
  debounce(() => GET /staff/lookup?dni=dni, 400ms)
}
```

---

**Enums útiles:**

```
paymentFrequency:  "weekly" | "monthly"
installmentsCount: 3 | 6 | 9
saleStatus:        "pending_admin_validation" | "rejected_admin" | "pending_environmental_visit"
                   | "environmental_rejected" | "pending_delivery" | "delivered" | "closed"
installmentStatus: "pending" | "paid" | "overdue" | "partial" | "defaulted"
productStatus:     "active" | "inactive"
staffRole:         "super_admin" | "gerente" | "administrativo" | "vendedor" | "cobrador"
societyStatus:     "active" | "inactive"
```

**Flujo de creación de venta (formulario):**
1. Seleccionar cliente — usar `GET /clients/lookup?documentNumber=...` para autocompletar o buscar en `GET /clients`
2. Seleccionar productos (uno o más, con cantidad y precio)
3. Elegir cantidad de cuotas: 3, 6 o 9
4. Elegir frecuencia: semanal o mensual
5. Ingresar fecha primer vencimiento
6. (Opcional) observaciones

El backend calcula el total, aplica la tasa y genera las cuotas automáticamente.

**Cálculo de cuota (para preview en frontend antes de confirmar):**
```
totalAmount      = suma(unitPrice × quantity)
rate             = según cuotas (obtener de GET /financing-config)
totalConInterés  = totalAmount × (1 + rate)
montoXCuota      = totalConInterés / cantidadCuotas
```
