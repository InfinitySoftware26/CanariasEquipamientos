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

# Roles Permitidos

| Rol       | Acceso             |
| --------- | ------------------ |
| ADMIN     | Completo           |
| SELLER    | Crear y visualizar |
| MANAGER   | Lectura            |
| COLLECTOR | Lectura parcial    |

---

# Estados Cliente

| Estado             | Descripción                |
| ------------------ | -------------------------- |
| ACTIVE             | Cliente operativo          |
| PENDING_VALIDATION | Esperando visita ambiental |
| REJECTED           | Cliente rechazado          |
| BLOCKED            | Cliente bloqueado          |
| DELINQUENT         | Cliente moroso             |

---

# Endpoints

---

# Crear Cliente

## Endpoint

```http
POST /clients
```

---

# Descripción

Permite registrar nuevo cliente potencial.

---

# Roles

* SELLER
* ADMIN

---

# Request

```json
{
  "fullName": "Juan Pérez",
  "dni": "40111222",
  "phone": "3415555555",
  "address": "San Martín 123",
  "zoneId": "uuid",
  "societyId": "uuid",
  "references": [],
  "observations": "Cliente recomendado"
}
```

---

# Validaciones

| Campo     | Regla     |
| --------- | --------- |
| fullName  | requerido |
| dni       | único     |
| phone     | requerido |
| address   | requerido |
| zoneId    | requerido |
| societyId | requerido |

---

# Response Success

```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "id": "uuid"
  }
}
```

---

# Buscar Clientes

## Endpoint

```http
GET /clients
```

---

# Query Params

| Parámetro | Tipo   |
| --------- | ------ |
| page      | number |
| limit     | number |
| search    | string |
| status    | string |
| zoneId    | uuid   |
| societyId | uuid   |

---

# Response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

# Obtener Cliente

## Endpoint

```http
GET /clients/:id
```

---

# Información Incluida

* datos personales
* historial ventas
* cuotas activas
* deuda total
* cobrador asignado
* visitas fallidas
* historial pagos

---

# Actualizar Cliente

## Endpoint

```http
PATCH /clients/:id
```

---

# Restricciones

* DNI no editable luego validación
* cambios críticos auditables

---

# Visita Ambiental

## Endpoint

```http
POST /clients/:id/environment-validation
```

---

# Objetivo

Registrar resultado visita ambiental realizada por administración.

---

# Roles

* ADMIN

---

# Request

```json
{
  "approved": true,
  "observations": "Domicilio validado"
}
```

---

# Resultado Operativo

## Si aprobado

* cliente pasa a ACTIVE
* puede aprobarse venta

---

## Si rechazado

* cliente pasa a REJECTED
* bloquea proceso venta

---

# Historial Cliente

## Endpoint

```http
GET /clients/:id/history
```

---

# Información

Incluye:

* ventas
* pagos
* cuotas
* atrasos
* visitas
* entregas
* observaciones

---

# Reglas Negocio

---

# Cliente Moroso

El sistema podrá marcar automáticamente clientes como:

```text
DELINQUENT
```

según reglas financieras futuras.

---

# Eliminación

Clientes NO deberán eliminarse físicamente.

Implementar:

```text
soft delete
```

---

# Auditoría

Registrar:

* creador cliente
* modificaciones
* validaciones
* bloqueos

---

# Seguridad

* JWT obligatorio
* permisos por rol
* filtrado por sociedad

---

# Paginación

Todos los listados deberán soportar:

* paginación
* filtros
* ordenamiento

---

# Escalabilidad Futura

Preparado para:

* scoring crediticio
* OCR DNI
* geolocalización
* firma digital
* app mobile cliente

---

# Estado Actual

Módulo aprobado para Fase 1.
