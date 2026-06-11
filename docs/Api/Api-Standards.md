# Canarias System — API Standards

# Objetivo

Definir las convenciones generales utilizadas por la API Backend.

Este documento debe ser respetado por todos los módulos del sistema.

---

# Versionado

La API utiliza versionado.

Base URL:

/api/v1


Ejemplo:

GET /api/v1/zones

GET /api/v1/sales

---

# HTTP Methods

La API utiliza métodos HTTP estándar.


## GET

Utilizado para consultas.


Ejemplo:

GET /zones


---

## POST

Utilizado para creación de recursos.


Ejemplo:

POST /zones


---

## PATCH

Utilizado para actualización parcial.


Ejemplo:

PATCH /zones/:id


---

## DELETE

Los DELETE no eliminan físicamente registros.

Se utiliza Soft Delete.

El registro cambia su estado:

active → inactive

---

# Naming Convention

Los endpoints deben utilizar:

- plural
- nombres en inglés
- kebab-case cuando corresponda


Correcto:

/staff-zones

/sales

/products


Incorrecto:

/getZones

/crearVenta

---

# Responses


## Success Response

Las respuestas exitosas deben mantener una estructura uniforme.

Ejemplo:
```json
{
  "data": {},
  "message": "Operation completed successfully"
}
```
---

## Collection Response

Los endpoints que devuelven listados deben incluir información de paginación.

Ejemplo:
```json
{
  "data": [],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

# Error Response

Los errores deben utilizar una estructura consistente.

Ejemplo:
```json
{
  "statusCode": 400,
  "message": "Validation error",
  "error": "Bad Request"
}
```
---

# HTTP Status Codes


## 200 OK

Operación exitosa.

Ejemplos:

- consulta realizada
- actualización correcta


## 201 Created

Recurso creado correctamente.

Ejemplo:

POST /zones


## 204 No Content

Operación realizada sin contenido de respuesta.

Ejemplo:

Soft delete


## 400 Bad Request

Error de validación.

Ejemplos:

- campos obligatorios faltantes
- datos inválidos


## 401 Unauthorized

Usuario no autenticado.

Ejemplo:

Token inexistente o inválido.


## 403 Forbidden

Usuario autenticado pero sin permisos.

Ejemplo:

SELLER intentando aprobar una venta.


## 404 Not Found

Recurso inexistente.

Ejemplo:

Buscar una zona que no existe.


## 409 Conflict

Conflicto con reglas de negocio.

Ejemplo:

Crear una zona con nombre repetido dentro de una sociedad.


---

# Authentication

Los endpoints protegidos requieren autenticación.

El sistema utiliza token de acceso.

Header requerido:

Authorization: Bearer {token}


Ejemplo:

Authorization: Bearer eyJhbGciOi...


---

# Authorization

Los permisos se manejan mediante roles.

Roles principales:

- SUPER_ADMIN
- MANAGER
- ADMIN
- SELLER
- COLLECTOR


Cada endpoint debe documentar:

- roles permitidos
- acción realizada
- restricciones


Ejemplo:

POST /sales

Roles permitidos:

SELLER
ADMIN


---

# Request Body

Los cuerpos enviados deben utilizar JSON.

Reglas:

- nombres consistentes con entidades
- campos obligatorios documentados
- validaciones definidas


Ejemplo:
```json
{
  "name": "Zona Norte",
  "description": "Zona comercial"
}
```

---

# Date Format

Todas las fechas deben utilizar formato ISO 8601.


Ejemplo:

2026-06-11T15:30:00Z


---

# Pagination

Los endpoints de consulta deben soportar paginación.


Ejemplo:

GET /zones?page=1&limit=20


Respuesta:
```json
{
 "data": [],
 "page": 1,
 "limit": 20,
 "total": 50
}
```

---

# Filtering

Los listados deben permitir filtros mediante query parameters.


Ejemplo:

GET /zones?status=active


---

# Soft Delete

Las entidades principales utilizan eliminación lógica.

DELETE no elimina físicamente el registro.


Ejemplo:

Antes:

status = active


Después:

status = inactive


---

# Audit

Las entidades importantes deben registrar:

- createdAt
- updatedAt
- createdBy
- updatedBy


Esto permite mantener trazabilidad de cambios.


---

# Estado

Documento vigente Sprint 02.