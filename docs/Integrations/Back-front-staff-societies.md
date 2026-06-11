# Integración Back ↔ Front — Staff Societies

# Objetivo

Documentar la integración entre Backend y Frontend para la asignación de personal a sociedades.

---

# Módulo

StaffSocietiesModule

---

# Entidad Relacionada

staff_societies

Representa la relación entre usuarios y sociedades.

---

# Endpoints Disponibles

## Obtener Staff de una Sociedad

### GET /societies/:id/staff

Permisos:

* MANAGER
* ADMIN

Descripción:

Obtiene el personal asignado a una sociedad.

Response:

```json
[
  {
    "staffId": "uuid",
    "name": "Juan Perez",
    "email": "juan@email.com",
    "role": "MANAGER",
    "status": "active",
    "assignedAt": "2026-01-01"
  }
]
```

---

## Asignar Staff a Sociedad

### POST /societies/:id/staff

Permisos:

* MANAGER

Body:

```json
{
  "staffId": "uuid",
  "status": "active"
}
```

Observaciones:

* status es opcional.
* valor por defecto: active.
* si la asignación ya existe se actualiza (upsert).

---

# Reglas de Negocio

## STAFF-SOCIETY-001

Un usuario puede pertenecer a una o múltiples sociedades.

---

## STAFF-SOCIETY-002

La asignación a una sociedad no modifica el rol original del usuario.

---

## STAFF-SOCIETY-003

Las asignaciones permiten compartir personal entre sociedades cuando el negocio lo requiera.

---

## STAFF-SOCIETY-004

Los usuarios con múltiples sociedades deberán seleccionar una sociedad activa al iniciar sesión.

---

## STAFF-SOCIETY-005

SUPER_ADMIN posee acceso global a todas las sociedades sin necesidad de asignación explícita.

---

# Códigos de Respuesta

| Código | Descripción             |
| ------ | ----------------------- |
| 200    | Consulta exitosa        |
| 201    | Asignación creada       |
| 409    | Conflicto de asignación |

---

# Estado

Documento vigente Sprint 02.
