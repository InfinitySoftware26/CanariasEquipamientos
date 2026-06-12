# Canarias System — Staff Scope Business Rules

# Objetivo

Documentar las reglas de negocio relacionadas con el alcance operativo de los empleados dentro del sistema.

Este alcance está definido mediante sociedades y zonas asignadas.

---

# Descripción

Un empleado puede operar dentro de una o varias sociedades.

Además puede tener asignaciones específicas de zonas según su función dentro de la organización.

El alcance del empleado determina qué información y operaciones puede gestionar.

---

# Staff Society Relationship

## BR-STAFF-SCOPE-001

Un empleado puede pertenecer a una o varias sociedades.

Ejemplo:

Empleado:

Juan Pérez

Sociedades:

- Canarias Equipamientos
- Canarias Motos

---

## BR-STAFF-SCOPE-002

La relación entre empleado y sociedad se administra mediante la entidad:

staff_societies

---

## BR-STAFF-SCOPE-003

La relación empleado-sociedad posee un estado.


Estados:

ACTIVE

INACTIVE


---

## BR-STAFF-SCOPE-004

Una relación inactiva no debe considerarse para operaciones nuevas.

---

# Staff Zone Relationship

## BR-STAFF-SCOPE-005

Un empleado puede estar asignado a una o varias zonas.


---

## BR-STAFF-SCOPE-006

La relación empleado-zona se administra mediante:

staff_zones


---

## BR-STAFF-SCOPE-007

Las zonas permiten organizar la operación comercial y territorial.


Ejemplos:

- vendedores por zona
- cobradores por zona
- visitas asignadas


---

# Roles y Alcance

## SELLER

Puede pertenecer a una o varias sociedades.

Puede tener zonas asignadas para registrar operaciones.


---

## COLLECTOR

Puede pertenecer a una o varias sociedades.

Puede tener zonas asignadas para realizar tareas operativas.


---

## ADMIN

Puede gestionar información dentro de las sociedades habilitadas.


---

# Reglas de Consistencia

## BR-STAFF-SCOPE-008

No se debe asignar una zona perteneciente a una sociedad donde el empleado no tenga relación activa.


---

## BR-STAFF-SCOPE-009

Las asignaciones deben mantener historial mediante estados.

No se eliminan físicamente.


---

# Eliminación

Las relaciones utilizan soft delete.

Cambiar:

status = inactive

mantiene trazabilidad histórica.


---

# Evolución Futura

Preparado para:

- permisos por sociedad
- permisos por zona
- restricciones de visualización
- rutas de cobradores
- reportes segmentados


---

# Estado

Documento vigente Sprint 02.