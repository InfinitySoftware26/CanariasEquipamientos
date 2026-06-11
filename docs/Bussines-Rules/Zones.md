# Canarias System — Zones Business Rules

# Objetivo

Documentar las reglas de negocio relacionadas al manejo de zonas.

---

# Descripción

Una zona representa una división operativa/comercial utilizada para organizar la gestión del negocio.

Las zonas pertenecen a una sociedad.

---

# Reglas de Zona


## BR-ZONE-001

Toda zona debe pertenecer a una sociedad.


---

## BR-ZONE-002

El nombre de una zona debe ser único dentro de una sociedad.

No es necesario que sea único globalmente.


Ejemplo:

Sociedad A:

Zona Norte


Sociedad B:

Zona Norte


Permitido.


---

## BR-ZONE-003

Una zona puede estar activa o inactiva.


---

## BR-ZONE-004

Una zona inactiva no debe utilizarse para nuevas operaciones.


---

# Estados


## ACTIVE

Zona habilitada.


## INACTIVE

Zona deshabilitada.


---

# Zona y Operaciones


Las zonas permiten organizar:

- vendedores asignados
- cobradores asignados
- operaciones comerciales futuras


---

# Eliminación


Las zonas utilizan soft delete.

Eliminar una zona:

NO elimina registros.


Modifica:

status = inactive


---

# Validaciones


Al asignar una zona:

El sistema debe validar:

- sociedad existente
- zona activa
- nombre disponible


---

# Auditoría

Registrar:

- creación
- modificación
- cambios de estado
- usuario responsable


---

# Estado

Documento vigente Sprint 02.