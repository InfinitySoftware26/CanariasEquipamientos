# Canarias System — Clients API

# Objetivo

Documentar el módulo de clientes del sistema.

El módulo será responsable de:

* gestión clientes
* búsqueda clientes
* validaciones comerciales
* asignación zonas
* historial cliente
* estado crediticio
* visitas ambientales

---

# Endpoint Base

```http
/api/v1/clients
```

---

# Autenticación y Acceso

Todos los endpoints del módulo requieren:

* autenticación mediante JWT;
* autorización mediante roles;
* contexto de sociedad mediante `SocietyGuard`.

Los roles permitidos se especifican en cada endpoint.

---

# Roles Permitidos

| Rol         | Acceso         |
| ----------- | -------------- |
| SUPER_ADMIN | Según endpoint |
| MANAGER     | Según endpoint |
| ADMIN       | Según endpoint |
| SELLER      | Según endpoint |
| COLLECTOR   | Según endpoint |

---

# Endpoints

---

# Precargar Cliente

## Endpoint

```http
POST /clients/preload
```

---

# Descripción

Permite precargar los datos de un cliente.

La operación utiliza `CreateClientDto`.

---

# Roles

* SELLER
* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Request

```json
{
  "name": "Juan",
  "surname": "Pérez",
  "documentNumber": "40111222",
  "address": "San Martín 123",
  "phone": "3415555555",
  "email": "juan@example.com",
  "zoneId": "uuid",
  "nameReference1": "María Pérez",
  "telReference1": "3415555556",
  "addressReference1": "Belgrano 456",
  "nameReference2": "Carlos Pérez",
  "telReference2": "3415555557",
  "addressReference2": "Mitre 789",
  "profession": "Comerciante",
  "monthlyIncome": "500000",
  "paymentMethod": "Mensual",
  "incomeDependents": "2",
  "additionalIncome": "100000",
  "housingSituation": "Alquilada",
  "contractDuration": "24 meses",
  "cuil": "20-40111222-3",
  "activeCredit": false,
  "observations": "Observaciones del cliente",
  "societyId": "uuid"
}
```

---

# Campos del Request

| Campo               | Tipo    | Requerido | Validación   |
| ------------------- | ------- | --------- | ------------ |
| `name`              | string  | No        | String       |
| `surname`           | string  | No        | String       |
| `documentNumber`    | string  | No        | String       |
| `address`           | string  | No        | String       |
| `phone`             | string  | No        | String       |
| `email`             | string  | No        | Email válido |
| `zoneId`            | UUID    | No        | UUID         |
| `nameReference1`    | string  | Sí        | String       |
| `telReference1`     | string  | Sí        | String       |
| `addressReference1` | string  | Sí        | String       |
| `nameReference2`    | string  | Sí        | String       |
| `telReference2`     | string  | Sí        | String       |
| `addressReference2` | string  | Sí        | String       |
| `profession`        | string  | No        | String       |
| `monthlyIncome`     | string  | No        | String       |
| `paymentMethod`     | string  | No        | String       |
| `incomeDependents`  | string  | No        | String       |
| `additionalIncome`  | string  | No        | String       |
| `housingSituation`  | string  | No        | String       |
| `contractDuration`  | string  | No        | String       |
| `cuil`              | string  | No        | String       |
| `activeCredit`      | boolean | No        | Boolean      |
| `observations`      | string  | No        | String       |
| `societyId`         | UUID    | No        | UUID         |

---

# Buscar Cliente

## Endpoint

```http
GET /clients/lookup
```

---

# Descripción

Permite buscar un cliente por número de documento o correo electrónico.

La ruta está destinada, entre otros usos, al autocompletado de formularios.

La consulta puede realizarse mediante:

```text
documentNumber
```

o:

```text
email
```

---

# Roles

* SELLER
* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Query Params

| Parámetro        | Tipo   | Requerido |
| ---------------- | ------ | --------- |
| `documentNumber` | string | No        |
| `email`          | string | No        |

---

# Response

La respuesta devuelve información del cliente encontrado e información relacionada con su pertenencia a la sociedad actual, incluyendo `alreadyInCurrentSociety`.

Si el cliente no existe, el endpoint responde `404 Not Found`.

---

# Listar Clientes

## Endpoint

```http
GET /clients
```

---

# Descripción

Permite consultar el listado de clientes utilizando paginación y filtros disponibles.

---

# Roles

* ADMIN
* MANAGER
* SUPER_ADMIN
* SELLER
* COLLECTOR

---

# Query Params

| Parámetro   | Tipo        | Requerido |
| ----------- | ----------- | --------- |
| `page`      | number      | No        |
| `perPage`   | number      | No        |
| `name`      | string      | No        |
| `societyId` | UUID/string | No        |

---

# Response

El endpoint devuelve el listado de clientes junto con la información de paginación proporcionada por el servicio.

---

# Obtener Cliente

## Endpoint

```http
GET /clients/:id
```

---

# Descripción

Permite obtener la información de un cliente mediante su identificador.

---

# Roles

* SELLER
* ADMIN
* MANAGER
* SUPER_ADMIN
* COLLECTOR

---

# Parámetros

| Parámetro | Tipo        | Requerido |
| --------- | ----------- | --------- |
| `id`      | UUID/string | Sí        |

---

# Actualizar Cliente

## Endpoint

```http
PATCH /clients/:id
```

---

# Descripción

Permite actualizar parcialmente la información de un cliente.

---

# Roles

* ADMIN
* MANAGER
* SUPER_ADMIN
* SELLER

---

# Request

Utiliza `UpdateClientDto`.

Todos los campos definidos en `CreateClientDto` son opcionales durante la actualización.

---

# Campos Actualizables

| Campo               | Tipo    |
| ------------------- | ------- |
| `name`              | string  |
| `surname`           | string  |
| `documentNumber`    | string  |
| `address`           | string  |
| `phone`             | string  |
| `email`             | string  |
| `zoneId`            | UUID    |
| `nameReference1`    | string  |
| `telReference1`     | string  |
| `addressReference1` | string  |
| `nameReference2`    | string  |
| `telReference2`     | string  |
| `addressReference2` | string  |
| `profession`        | string  |
| `monthlyIncome`     | string  |
| `paymentMethod`     | string  |
| `incomeDependents`  | string  |
| `additionalIncome`  | string  |
| `housingSituation`  | string  |
| `contractDuration`  | string  |
| `cuil`              | string  |
| `activeCredit`      | boolean |
| `observations`      | string  |
| `societyId`         | UUID    |

---

# Solicitar Verificación

## Endpoint

```http
POST /clients/:id/request-verification
```

---

# Descripción

Permite solicitar la verificación de una precarga de cliente.

---

# Roles

* SELLER
* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Request

```json
{
  "note": "Nota del vendedor para el verificador"
}
```

---

# Campos del Request

| Campo  | Tipo   | Requerido | Validación |
| ------ | ------ | --------- | ---------- |
| `note` | string | No        | String     |

---

# Historial Cliente

## Endpoint

```http
GET /clients/:id/history
```

---

# Descripción

Permite consultar el historial asociado a un cliente.

---

# Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Información

El historial puede incluir información relacionada con:

* ventas
* pagos
* cuotas
* atrasos
* visitas
* entregas
* observaciones

---

# Seguridad

El módulo utiliza:

* JWT Authentication;
* Role-Based Access Control;
* Society Guard.

Los permisos de acceso se determinan mediante los roles definidos en cada endpoint.

---

# Paginación

El listado de clientes utiliza parámetros de paginación:

```text
page
perPage
```

Los filtros actualmente disponibles son:

```text
name
societyId
```

---

# Auditoría

Las operaciones que correspondan deberán mantener trazabilidad sobre:

* creación del cliente;
* modificaciones;
* solicitudes de verificación;
* validaciones;
* bloqueos.

---

# Escalabilidad Futura

Preparado para:

* scoring crediticio
* OCR DNI
* geolocalización
* firma digital
* app mobile cliente

---

# Estado

Documento actualizado Sprint 05.