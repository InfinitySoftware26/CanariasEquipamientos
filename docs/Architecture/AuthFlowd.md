# Canarias System — Authentication Flow

# Objetivo del Documento

Definir la arquitectura y flujo de autenticación y autorización del sistema Canarias System.

---

# Estrategia de Seguridad

El sistema utilizará:

```text id="x4u9tg"
JWT Authentication
```

con autorización basada en:

* roles
* permisos
* sociedades

---

# Componentes Principales

* login
* access token
* refresh token
* guards
* role validation
* session validation

---

# Flujo General

```text
Usuario login
      ↓
Validación credenciales
      ↓
Generación JWT
      ↓
Frontend almacena sesión
      ↓
Carga sociedades disponibles
      ↓
Usuario selecciona sociedad activa
      ↓
Contexto de sociedad establecido
      ↓
Requests autenticados con sociedad activa
      ↓
Guards validan acceso

---

# Login

El usuario deberá autenticarse mediante:

* email
* password

---

# Validación Passwords

Passwords almacenadas mediante:

```text id="x9w6ra"
bcrypt
```

---

# JWT Payload

El token deberá incluir:

```json id="n5g7tb"
{
  "sub": "staff_id",
  "role": "MANAGER",
  "email": "email",
  "societies": [
    "society_uuid_1",
    "society_uuid_2"
  ],
  "active_society": "society_uuid"
}
```

---

# Access Token

Responsable de:

* autenticación requests
* autorización básica
* identificación usuario

---

# Refresh Token

Responsable de:

* renovación sesión
* persistencia autenticación

---

# Expiración Tokens

| Token         | Duración |
| ------------- | -------- |
| Access Token  | 1h       |
| Refresh Token | 7d       |

---

# Guards

NestJS Guards deberán validar:

* JWT válido
* permisos
* roles
* acceso sociedad

---

# Roles Iniciales

```text id="j5z2sy"
SUPER_ADMIN
ADMIN
SELLER
COLLECTOR
MANAGER
```

---

# SUPER_ADMIN

* Acceso global a todas las sociedades.
* Puede crear y administrar otros SUPER_ADMIN.
* Solamente para uso de administración central y pruebas de configuración.

---

# Role-Based Access Control

El sistema implementará:

```text id="u3p8kd"
RBAC
```

---

# Segmentación Multi-Sociedad

El backend deberá validar:

* sociedad usuario
* permisos operativos
* acceso contextual

---

# Selección de Sociedad Activa

El sistema permitirá seleccionar una sociedad activa según el alcance del usuario.

---

## SUPER_ADMIN

Puede acceder a todas las sociedades.

Debe seleccionar la sociedad sobre la cual desea operar.

---

## MANAGER

Puede acceder únicamente a las sociedades asignadas mediante staff_societies.

Si posee múltiples sociedades, deberá seleccionar la sociedad activa.

---

## Otros Roles

La sociedad será determinada automáticamente según la asignación del usuario.

---

# Validación de Contexto

Backend deberá validar:

- usuario autenticado
- sociedad activa
- relación usuario-sociedad
- permisos dentro del contexto seleccionado

---

# Logout

El logout deberá:

* invalidar refresh token
* cerrar sesión frontend

---

# Protección Endpoints

Todos los endpoints privados deberán utilizar:

* JWT Guards
* Role Guards
* Society Validation

---

# Endpoints Públicos

Ejemplos:

```text id="n4t8gh"
POST /auth/login
POST /auth/refresh
```

---

# Endpoints Privados

Todos los demás endpoints.

---

# Manejo de Errores

El backend utilizará el sistema de exceptions nativo de NestJS.

Todas las validaciones críticas deberán lanzar exceptions controladas mediante:

* UnauthorizedException
* ForbiddenException
* BadRequestException
* NotFoundException
* ConflictException
* Custom Exceptions

---

# Centralización de Errores

Las exceptions deberán centralizarse mediante:

```text id="s8f4tm"
Global Exception Filters
```

para mantener consistencia en las respuestas API.

---

# Estructura Standard Error Response

Formato obligatorio:

```json id="k2x9bg"
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized",
  "timestamp": "2026-05-28T12:00:00.000Z",
  "path": "/auth/login"
}
```

---

# Objetivos

La estrategia centralizada permitirá:

* respuestas consistentes
* mejor mantenibilidad
* debugging simplificado
* auditoría errores
* desacoplamiento controladores

---

# Exceptions Custom

El sistema podrá incorporar exceptions propias para reglas negocio.

Ejemplos:

* SaleAlreadyApprovedException
* InvalidCollectionException
* SocietyAccessDeniedException
* RouteAlreadyClosedException

---

# Logging de Errores

Toda exception crítica deberá registrarse mediante sistema centralizado de logging.

---

# Consideraciones Técnicas

* Controllers no deben manejar errores manualmente.
* Las exceptions deben propagarse hacia filters globales.
* La lógica de negocio debe lanzar exceptions semánticas.


---

# Auditoría Seguridad

Registrar:

* logins
* logouts
* intentos fallidos
* cambios password
* accesos críticos

---

# Seguridad Futura

La arquitectura permitirá incorporar:

* MFA
* device tracking
* geolocation validation
* session management
* suspicious login detection

---

# Consideraciones Técnicas

* Backend controla seguridad real
* Frontend nunca controla permisos críticos
* JWT stateless
* Guards centralizados

---

# Estado Actual

Fase inicial de arquitectura autenticación.
