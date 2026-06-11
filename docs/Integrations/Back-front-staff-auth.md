# Integración Back ↔ Front — Auth & Staff

# Objetivo

Documentar el contrato de integración entre Backend y Frontend para los procesos de autenticación y gestión básica de usuarios del sistema.

---

# Módulos

* AuthModule
* StaffModule

---

# Base URL

Todos los endpoints utilizan el prefijo global:

```text
/api/v1
```

Ejemplo local:

```text
http://localhost:3001/api/v1
```

---

# AUTH

## Login

### POST /auth/login

Descripción:

Permite autenticar un usuario dentro del sistema.

Body:

```json
{
  "email": "usuario@empresa.com",
  "password": "Password123"
}
```

Response esperada:

```json
{
  "accessToken": "<jwt>",
  "user": {
    "staffId": "uuid",
    "name": "Juan Perez",
    "email": "usuario@empresa.com",
    "role": "MANAGER",
    "societies": [
      {
        "id": "uuid-1",
        "name": "Canarias Equipamientos"
      },
      {
        "id": "uuid-2",
        "name": "Canarias Motos"
      }
    ]
  }
}
```

---

## Comportamiento esperado del Frontend

### Usuario con una sola sociedad

El sistema debe seleccionar automáticamente dicha sociedad como contexto activo.

---

### Usuario con múltiples sociedades

El sistema debe mostrar un selector de sociedades inmediatamente después del login.

La sociedad seleccionada será utilizada como contexto operativo para todas las consultas posteriores.

---

### Usuario SUPER_ADMIN

El sistema debe mostrar el selector de sociedades.

SUPER_ADMIN posee acceso global a todas las sociedades del sistema.

---

## Refresh Token

### POST /auth/refresh

Descripción:

Genera un nuevo access token utilizando el refresh token almacenado en cookie.

Response:

```json
{
  "accessToken": "<nuevo-jwt>"
}
```

---

## Logout

### POST /auth/logout

Descripción:

Finaliza la sesión actual.

Response:

```text
204 No Content
```

---

# STAFF

## Obtener Perfil Actual

### GET /staff/me

Permisos:

* Usuario autenticado

Headers:

```http
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "staffId": "uuid",
  "name": "Juan Perez",
  "dni": "12345678",
  "email": "usuario@empresa.com",
  "role": "MANAGER",
  "phone": null,
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

---

## Crear Usuario

### POST /staff

Permisos:

* SUPER_ADMIN
* MANAGER
* ADMIN

Headers:

```http
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "name": "Juan Perez",
  "dni": "12345678",
  "email": "juan@empresa.com",
  "password": "Password123",
  "role": "SELLER"
}
```

---

# Reglas de Negocio

## AUTH-001

No existe registro público de usuarios.

Toda alta de personal debe realizarse desde una cuenta autorizada.

---

## AUTH-002

Las contraseñas son almacenadas mediante hashing seguro.

---

## AUTH-003

La autenticación se realiza mediante JWT.

---

## AUTH-004

Los usuarios pueden pertenecer a una o múltiples sociedades.

---

## AUTH-005

La sociedad activa seleccionada luego del login determina el alcance de datos visualizados por el usuario.

---

## AUTH-006

SUPER_ADMIN posee acceso global a todas las sociedades del sistema.

---

## STAFF-001

No se permiten usuarios con email duplicado.

---

## STAFF-002

No se permiten usuarios con DNI duplicado.

---

## STAFF-003

Los permisos de creación dependen del rol del usuario autenticado.

---

## STAFF-004

La pertenencia a sociedades se administra mediante la entidad:

```text
staff_societies
```

---

# Reglas de Seguridad

## SECURITY-001

El refresh token se almacena como cookie HttpOnly.

No debe ser manipulado desde el frontend.

---

## SECURITY-002

El frontend debe utilizar:

```text
credentials: include
```

en las operaciones relacionadas con autenticación.

---

## SECURITY-003

El access token debe enviarse mediante:

```http
Authorization: Bearer <token>
```

---

# Roles del Sistema

Roles soportados actualmente:

* SUPER_ADMIN
* MANAGER
* ADMIN
* SELLER
* COLLECTOR

---

# Matriz de Acceso

| Acción        | SUPER_ADMIN | MANAGER | ADMIN | SELLER | COLLECTOR |
| ------------- | ----------- | ------- | ----- | ------ | --------- |
| Login         | ✓           | ✓       | ✓     | ✓      | ✓         |
| Refresh Token | ✓           | ✓       | ✓     | ✓      | ✓         |
| Logout        | ✓           | ✓       | ✓     | ✓      | ✓         |
| Ver Perfil    | ✓           | ✓       | ✓     | ✓      | ✓         |
| Crear Staff   | ✓           | ✓       | ✓*    | ✗      | ✗         |

* ADMIN solo podrá crear usuarios permitidos según las reglas de negocio vigentes.

---

# Consideraciones Frontend

Al iniciar sesión:

1. Ejecutar login.
2. Almacenar access token.
3. Obtener perfil del usuario.
4. Verificar cantidad de sociedades disponibles.
5. Si existe más de una sociedad:

   * mostrar selector de sociedad.
6. Persistir la sociedad activa seleccionada.
7. Cargar el dashboard correspondiente al rol.

---

# Códigos de Respuesta

| Código | Descripción        |
| ------ | ------------------ |
| 200    | Operación exitosa  |
| 201    | Usuario creado     |
| 204    | Logout exitoso     |
| 401    | No autenticado     |
| 403    | Sin permisos       |
| 409    | Conflicto de datos |

---

# Estado

Documento vigente Sprint 02.
