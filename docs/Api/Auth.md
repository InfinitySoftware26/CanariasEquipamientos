# Canarias System — Auth API

# Objetivo

Documentar los endpoints de autenticación y gestión de sesión del sistema.

El módulo `auth` expone las operaciones relacionadas con:

* autenticación de usuarios internos;
* emisión de access tokens;
* renovación de access tokens;
* selección de sociedad;
* cierre de sesión.

---

# Endpoint Base

```http
/api/v1/auth
```

---

# Autenticación

El sistema utiliza:

```text
JWT Authentication
```

Los endpoints protegidos requieren un access token válido mediante el header:

```http
Authorization: Bearer {accessToken}
```

El access token contiene la información necesaria para identificar al usuario autenticado y la sociedad actualmente seleccionada.

---

# Roles del Sistema

| Rol         | Descripción                                       |
| ----------- | ------------------------------------------------- |
| SUPER_ADMIN | Acceso administrativo global del sistema          |
| MANAGER     | Gestión y administración según permisos asignados |
| ADMIN       | Gestión operativa                                 |
| SELLER      | Gestión de clientes y ventas                      |
| COLLECTOR   | Gestión de cobranzas y operaciones de entrega     |

Los roles se utilizan para controlar el acceso a los endpoints mediante los guards correspondientes.

---

# Tokens

El sistema utiliza dos tipos de token:

* Access Token
* Refresh Token

## Access Token

El access token:

* se devuelve en las operaciones de login y selección de sociedad;
* debe enviarse mediante `Authorization: Bearer`;
* contiene el identificador del usuario;
* contiene su email;
* contiene su rol;
* contiene el `societyId` correspondiente al contexto actual.

La duración se configura mediante:

```text
JWT_EXPIRATION
```

Si la variable no está configurada, el backend utiliza:

```text
15m
```

## Refresh Token

El refresh token:

* no se devuelve dentro del body de las respuestas;
* se almacena en una cookie HTTP-only;
* utiliza el nombre:

```text
refresh_token
```

* utiliza `path=/`;
* utiliza `SameSite=Strict`;
* utiliza `Secure` cuando el entorno es producción;
* se renueva al utilizar el endpoint de refresh;
* utiliza una duración de `7 días`.

La duración actualmente configurada por el controller es:

```text
7d
```

El frontend no debe enviar el refresh token manualmente dentro del body del endpoint `/auth/refresh`.

---

# Endpoints

## Login

### Endpoint

```http
POST /auth/login
```

### Acceso

Público.

### Descripción

Autentica un usuario interno mediante email y contraseña.

### Request Body

```json
{
  "email": "admin@canarias.com",
  "password": "password"
}
```

### Response

La respuesta contiene el access token y los datos básicos del usuario autenticado.

```json
{
  "accessToken": "jwt-token",
  "user": {
    "staffId": "uuid",
    "name": "Juan Pérez",
    "email": "admin@canarias.com",
    "role": "ADMIN",
    "societyId": "uuid",
    "societies": [
      {
        "societyId": "uuid",
        "societyName": "Canarias",
        "status": "active"
      }
    ]
  }
}
```

### Refresh Token

El refresh token se establece mediante una cookie HTTP-only:

```http
Set-Cookie: refresh_token=...
```

No forma parte del JSON de respuesta.

---

# Refresh Token

## Endpoint

```http
POST /auth/refresh
```

### Acceso

Público.

### Descripción

Renueva el access token utilizando el refresh token almacenado en la cookie HTTP-only.

### Request

No requiere body.

El refresh token se obtiene de:

```text
Cookie: refresh_token
```

### Response

```json
{
  "accessToken": "new-access-token"
}
```

Al realizar correctamente la renovación, el backend también establece una nueva cookie `refresh_token`.

### Error

Si no existe el refresh token:

```text
401 Unauthorized
```

Si el refresh token es inválido o expiró:

```text
403 Forbidden
```

---

# Select Society

## Endpoint

```http
POST /auth/select-society
```

### Acceso

Autenticado.

### Descripción

Permite seleccionar la sociedad que será utilizada como contexto del usuario autenticado.

La operación genera nuevos tokens asociados a la sociedad seleccionada.

### Headers

```http
Authorization: Bearer {accessToken}
```

### Request Body

```json
{
  "societyId": "uuid"
}
```

### Response

```json
{
  "accessToken": "new-access-token",
  "societyId": "uuid"
}
```

El nuevo refresh token se establece mediante la cookie HTTP-only `refresh_token`.

---

# Logout

## Endpoint

```http
POST /auth/logout
```

### Acceso

Autenticado.

### Descripción

Cierra la sesión actual y elimina la cookie `refresh_token`.

### Headers

```http
Authorization: Bearer {accessToken}
```

### Response

```http
204 No Content
```

---

# Guards

## JWT Guard

El JWT Guard protege los endpoints que requieren autenticación.

El token debe enviarse mediante:

```http
Authorization: Bearer {accessToken}
```

---

## Local Auth Guard

El endpoint de login utiliza el guard de autenticación local:

```text
AuthGuard("local")
```

Este guard valida las credenciales recibidas antes de ejecutar la operación de login.

---

## Roles Guard

El sistema dispone de un Roles Guard para controlar el acceso a operaciones según el rol del usuario.

Los endpoints que requieren autorización específica deben declarar los roles permitidos mediante el mecanismo de roles del sistema.

---

# JWT Payload

El payload utilizado para generar los tokens contiene:

```json
{
  "sub": "staff-uuid",
  "email": "admin@canarias.com",
  "role": "ADMIN",
  "societyId": "society-uuid"
}
```

### Campos

| Campo       | Tipo          | Descripción                                 |
| ----------- | ------------- | ------------------------------------------- |
| `sub`       | string        | Identificador del usuario (`staffId`)       |
| `email`     | string        | Email del usuario                           |
| `role`      | string        | Rol del usuario                             |
| `societyId` | string | null | Sociedad correspondiente al contexto actual |

---

# Configuración

## Access Token

Variable de entorno:

```text
JWT_EXPIRATION
```

Valor utilizado por defecto:

```text
15m
```

## Refresh Token

Variables de entorno:

```text
JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRATION
```

Valor utilizado por defecto para la duración:

```text
7d
```

---

# Cookies

El refresh token utiliza la cookie:

```text
refresh_token
```

Configuración utilizada actualmente:

| Propiedad  | Valor                |
| ---------- | -------------------- |
| `httpOnly` | `true`               |
| `sameSite` | `strict`             |
| `secure`   | `true` en producción |
| `path`     | `/`                  |
| `maxAge`   | 7 días               |

---

# HTTP Status Codes

Los endpoints de autenticación utilizan los códigos HTTP definidos por los estándares generales de la API.

| Código             | Uso                                                                        |
| ------------------ | -------------------------------------------------------------------------- |
| `200 OK`           | Login, refresh y selección de sociedad exitosos                            |
| `204 No Content`   | Logout exitoso                                                             |
| `401 Unauthorized` | Credenciales inválidas, falta de autenticación o ausencia de refresh token |
| `403 Forbidden`    | Refresh token inválido/expirado o acceso no permitido                      |

---

# Estructura de Errores

Los errores son gestionados mediante las excepciones HTTP de NestJS.

Ejemplo:

```json
{
  "statusCode": 401,
  "message": "Credenciales invalidas",
  "error": "Unauthorized"
}
```

La estructura concreta de error debe mantenerse alineada con la configuración global de excepciones de la API.

---

# Endpoints Resumen

| Método | Endpoint               | Acceso      | Descripción                    |
| ------ | ---------------------- | ----------- | ------------------------------ |
| `POST` | `/auth/login`          | Público     | Autenticar usuario             |
| `POST` | `/auth/refresh`        | Público     | Renovar tokens mediante cookie |
| `POST` | `/auth/select-society` | Autenticado | Seleccionar sociedad           |
| `POST` | `/auth/logout`         | Autenticado | Cerrar sesión                  |

---

# Alcance del Documento

Este documento define únicamente el contrato de la API del módulo `auth`.

Las reglas de negocio relacionadas con:

* estados de usuarios;
* políticas de autenticación;
* permisos por rol;
* selección de sociedad;
* auditoría;
* políticas de seguridad;
* invalidación de sesiones;

deben documentarse en los documentos correspondientes de **Business Rules** y no forman parte de este contrato API.

# Estado

Documento actualizado Sprint 05.