# Integración Back ↔ Front — Staff Zones

# Objetivo

Documentar la integración entre Backend y Frontend para la asignación de personal a zonas.

---

# Módulo

StaffZonesModule

---

# Entidad Relacionada

staff_zones

Representa la asignación de personal operativo a una zona.

---

# Endpoints Disponibles

## Obtener Staff de una Zona

### GET /zones/:id/staff

Permisos:

* SUPER_ADMIN
* MANAGER
* ADMIN

Descripción:

Obtiene el personal activo asignado a una zona.

Response:

```json
[
  {
    "staffId": "uuid",
    "name": "Juan Perez",
    "email": "juan@email.com",
    "role": "SELLER",
    "status": "active",
    "assignedAt": "2026-01-01"
  }
]
```

---

## Asignar Staff a Zona

### POST /zones/:id/staff

Permisos:

* SUPER_ADMIN
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

## Desasignar Staff de Zona

### DELETE /zones/:id/staff/:staffId

Permisos:

* SUPER_ADMIN
* MANAGER

Comportamiento:

Soft Delete.

La asignación cambia a estado inactive.

---

# Reglas de Negocio

## STAFF-ZONE-001

Solo pueden asignarse usuarios con rol:

* SELLER
* COLLECTOR

---

## STAFF-ZONE-002

Una zona puede contener múltiples usuarios asignados.

---

## STAFF-ZONE-003

Un usuario puede pertenecer a múltiples zonas.

---

## STAFF-ZONE-004

Las consultas retornan únicamente asignaciones activas.

---

# Códigos de Respuesta

| Código | Descripción                |
| ------ | -------------------------- |
| 200    | Consulta exitosa           |
| 201    | Asignación creada          |
| 204    | Asignación desactivada     |
| 404    | Zona o usuario inexistente |

---

# Estado

Documento vigente Sprint 02.
