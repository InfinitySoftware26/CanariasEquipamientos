# Canarias System — Auth API

# Objetivo

Documentar el módulo de autenticación y autorización del sistema.

El módulo auth será responsable de:

* autenticación usuarios internos
* control acceso
* autorización por roles
* emisión JWT
* refresh tokens
* control sesiones
* protección endpoints

---

# Endpoint Base

```http
/api/v1/auth
```

---

# Roles del Sistema

| Rol         | Descripción                                               |
| ----------- | --------------------------------------------------------- |
| SUPER_ADMIN | Acceso total a todas las sociedades y creación de super admins |
| ADMIN       | Gestión operativa total                                   |
| MANAGER     | Visualización reportes y métricas                         |
| COLLECTOR   | Gestión cobranzas y entregas                              |
| SELLER      | Gestión clientes y ventas                                 |

---

# Arquitectura Seguridad

El sistema implementará:

```text
JWT Authentication
RBAC Authorization
```

---

# Endpoints

---

# Login

## Endpoint

```http
POST /auth/login
```

---

# Descripción

Permite autenticación de empleados del sistema.

---

# Acceso

Público.

---

# Request

```json
{
  "email": "admin@canarias.com",
  "password": "password"
}
```

---

# Validaciones

| Campo    | Regla     |
| -------- | --------- |
| email    | requerido |
| password | requerido |

---

# Response Success

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "staff": {
      "id": "uuid",
      "fullName": "Juan Pérez",
      "role": "ADMIN",
      "societyId": "uuid"
    }
  }
}
```

---

# Response Error

```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": {
    "code": "INVALID_CREDENTIALS"
  }
}
```

---

# Refresh Token

## Endpoint

```http
POST /auth/refresh
```

---

# Objetivo

Renovar access token expirado.

---

# Request

```json
{
  "refreshToken": "refresh-token"
}
```

---

# Response

```json
{
  "success": true,
  "data": {
    "accessToken": "new-access-token"
  }
}
```

---

# Logout

## Endpoint

```http
POST /auth/logout
```

---

# Objetivo

Cerrar sesión actual.

---

# Headers

```http
Authorization: Bearer JWT_TOKEN
```

---

# Perfil Usuario Actual

## Endpoint

```http
GET /auth/me
```

---

# Objetivo

Obtener información usuario autenticado.

---

# Headers

```http
Authorization: Bearer JWT_TOKEN
```

---

# Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Juan Pérez",
    "email": "admin@canarias.com",
    "role": "ADMIN",
    "societies": []
  }
}
```

---

# Guards

---

# JWT Guard

Protege endpoints autenticados.

---

# Roles Guard

Controla acceso según roles.

---

# Seguridad

---

# Passwords

* hash bcrypt obligatorio
* nunca almacenar plaintext
* mínimo 8 caracteres

---

# JWT

## Access Token

Duración recomendada:

```text
15m
```

---

## Refresh Token

Duración recomendada:

```text
7d
```

---

# Middleware Context

Cada request autenticado deberá incluir:

* staff_id
* role
* society_id
* permissions

---

# Response Standard

## Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

## Error

```json
{
  "success": false,
  "message": "Unauthorized",
  "error": {
    "code": "UNAUTHORIZED"
  }
}
```

---

# Errores Comunes

| Código              | Descripción            |
| ------------------- | ---------------------- |
| INVALID_CREDENTIALS | Credenciales inválidas |
| TOKEN_EXPIRED       | Token expirado         |
| UNAUTHORIZED        | No autenticado         |
| FORBIDDEN           | Sin permisos           |

---

# Reglas Negocio

* usuarios inactivos no podrán autenticarse
* sesiones podrán invalidarse manualmente
* accesos deberán auditarse
* endpoints sensibles requerirán autenticación

---

# Escalabilidad Futura

Preparado para:

* MFA
* OAuth
* permisos dinámicos
* sesiones múltiples
* autenticación mobile
* biometría

---

# Estado Actual

Módulo aprobado para Fase 1.
