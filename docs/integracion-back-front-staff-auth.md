# Integración backend → frontend: auth y staff

## Resumen

El backend ya expone la autenticación y el módulo de staff para que el frontend pueda integrarse sin depender de rutas ad-hoc.

### Estado actual del backend

- Autenticación con JWT (`auth`)
- Refresh token gestionado por cookie `refresh_token`
- Módulo `staff` con perfil, listado y creación de empleados
- Prefijo global del backend: `/api/v1`

## Base de integración

El backend corre con prefijo global `/api/v1`.

**Base sugerida para frontend:**

- `http://localhost:3001/api/v1`

> Si el frontend usa `NEXT_PUBLIC_API_URL`, debe apuntar al host del backend y el cliente debe sumar `/api/v1` a las rutas.

## Endpoints disponibles

### 1) Login

**Ruta:** `POST /api/v1/auth/login`

**Body esperado:**

```json
{
  "email": "usuario@empresa.com",
  "password": "Password123"
}
```

**Respuesta esperada:**

```json
{
  "accessToken": "<jwt>",
  "user": {
    "staffId": "uuid",
    "name": "Juan Perez",
    "email": "usuario@empresa.com",
    "role": "vendedor",
    "societyId": "uuid"
  }
}
```

**Comportamiento del backend:**

- Valida credenciales con `bcrypt`
- Devuelve `accessToken`
- Coloca `refresh_token` en cookie `HttpOnly`

**Uso desde frontend:**

- Enviar `credentials: include`
- Guardar `accessToken` en memoria, estado global o local storage según la estrategia del equipo

---

### 2) Refresh token

**Ruta:** `POST /api/v1/auth/refresh`

**Respuesta esperada:**

```json
{
  "accessToken": "<nuevo-jwt>"
}
```

**Comportamiento del backend:**

- Lee el refresh token desde la cookie `refresh_token`
- Renueva el `accessToken`
- Reemplaza la cookie con un nuevo refresh token

**Uso desde frontend:**

- Llamar cuando el access token expire
- Mantener `credentials: include`

---

### 3) Logout

**Ruta:** `POST /api/v1/auth/logout`

**Respuesta:** `204 No Content`

**Comportamiento del backend:**

- Limpia la cookie `refresh_token`

---

### 4) Perfil actual del staff

**Ruta:** `GET /api/v1/staff/me`

**Headers requeridos:**

```http
Authorization: Bearer <accessToken>
```

**Respuesta esperada:**

```json
{
  "staffId": "uuid",
  "name": "Juan Perez",
  "dni": "12345678",
  "email": "usuario@empresa.com",
  "role": "vendedor",
  "societyId": "uuid",
  "phone": null,
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

**Uso desde frontend:**

- Llamar al entrar a la app para hidratar el perfil del usuario

---

### 5) Crear staff (administración interna)

**Ruta:** `POST /api/v1/staff`

**Headers requeridos:**

```http
Authorization: Bearer <accessToken>
```

**Body esperado:**

```json
{
  "name": "Juan Perez",
  "dni": "12345678",
  "email": "juan@empresa.com",
  "password": "Password123",
  "role": "vendedor",
  "societyId": "uuid"
}
```

**Reglas del negocio:**

- La creación de staff es interna y requiere usuario autenticado.
- Los gerentes pueden registrar administradores, vendedores y cobradores.
- Los administradores pueden registrar vendedores y cobradores.
- No hay auto-registro público.

**Restricciones del backend:**

- El rol objetivo debe estar permitido según el rol del usuario autenticado.
- No se permiten emails o DNI duplicados.
- Se guarda la contraseña hashada.

## Reglas de seguridad y comportamiento del frontend

### Cookies

- El backend usa `refresh_token` como cookie `HttpOnly`
- El frontend **no debe** intentar leer ni manipular esta cookie directamente
- Debe usar `credentials: include` en cada request que requiera refresh o sesión

### Tokens

- `accessToken` se devuelve en el body del login y debe manejarse en el frontend
- El token debe enviarse en `Authorization: Bearer <token>` en los endpoints protegidos

### Mapeo de roles

Roles soportados en el backend:

- `gerente`
- `administrativo`
- `vendedor`
- `cobrador`

## Integración recomendada en frontend

1. Consumir `POST /auth/login` al iniciar sesión.
2. Guardar `accessToken` en estado global.
3. Enviar `Authorization: Bearer <token>` a `/staff/me` y demás endpoints protegidos.
4. Para crear staff, usar `POST /staff` únicamente desde usuarios con permisos adecuados.
5. Usar `POST /auth/refresh` cuando expire el access token.
6. Usar `POST /auth/logout` al cerrar sesión.

## Matriz de permisos por rol

| Rol              | Login | `/auth/refresh` | `/auth/logout` | `/staff/me` | `/staff`                                |
| ---------------- | ----- | --------------- | -------------- | ----------- | --------------------------------------- |
| `gerente`        | ✅    | ✅              | ✅             | ✅          | ✅                                      |
| `administrativo` | ✅    | ✅              | ✅             | ✅          | ✅ (solo crear vendedores y cobradores) |
| `vendedor`       | ✅    | ✅              | ✅             | ✅          | ❌                                      |
| `cobrador`       | ✅    | ✅              | ✅             | ✅          | ❌                                      |

## Puntos de atención

- El backend ya expone la autenticación y staff; el frontend no necesita ajustes de base en código de ejemplo si apunta a `/api/v1`.
- No existe endpoint público de registro.
- El flujo de alta de personal debe ejecutarse desde la app autenticada con rol permitido.

## Resumen operativo para el equipo frontend

- Login: `POST /api/v1/auth/login`
- Refresh: `POST /api/v1/auth/refresh`
- Logout: `POST /api/v1/auth/logout`
- Perfil: `GET /api/v1/staff/me`
- Crear staff: `POST /api/v1/staff`

## Archivos base del backend consultados

- `backend/src/modules/auth/controllers/auth.controller.ts`
- `backend/src/modules/auth/services/auth.service.ts`
- `backend/src/modules/staff/controllers/staff.controller.ts`
- `backend/src/modules/staff/services/staff.service.ts`
- `backend/src/modules/staff/staff.module.ts`
