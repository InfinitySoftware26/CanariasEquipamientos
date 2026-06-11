# Integración Back ↔ Front — Zones

# Objetivo

Documentar el contrato de integración entre Backend y Frontend para la gestión de zonas.

---

# Módulo

ZonesModule

---

# Endpoints Disponibles

## Obtener Zonas

### GET /zones

Permisos:

* SUPER_ADMIN
* MANAGER
* ADMIN

Descripción:

Obtiene todas las zonas disponibles dentro del contexto de la sociedad activa.

---

## Obtener Zona

### GET /zones/:id

Permisos:

* SUPER_ADMIN
* MANAGER
* ADMIN

Descripción:

Obtiene el detalle de una zona específica.

---

## Crear Zona

### POST /zones

Permisos:

* SUPER_ADMIN
* MANAGER

Body:

```json
{
  "name": "Zona Norte",
  "description": "Opcional"
}
```

---

## Editar Zona

### PATCH /zones/:id

Permisos:

* SUPER_ADMIN
* MANAGER

Body:

```json
{
  "name": "Nuevo nombre",
  "description": "Descripción",
  "status": "inactive"
}
```

---

## Desactivar Zona

### DELETE /zones/:id

Permisos:

* SUPER_ADMIN
* MANAGER

Comportamiento:

Soft Delete.

La zona no se elimina físicamente de la base de datos.

---

# Reglas de Negocio

## ZONE-001

El nombre de una zona debe ser único dentro de una misma sociedad.

---

## ZONE-002

Dos sociedades diferentes pueden tener zonas con el mismo nombre.

---

## ZONE-003

Las zonas inactivas no deben visualizarse en listados operativos.

---

# Códigos de Respuesta

| Código | Descripción      |
| ------ | ---------------- |
| 200    | Consulta exitosa |
| 201    | Zona creada      |
| 204    | Zona desactivada |
| 409    | Nombre duplicado |

---

# Estado

Documento vigente Sprint 02.
