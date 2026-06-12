# Canarias System — Business Rules — Hojas de Ruta

# Objetivo

Definir las reglas operativas vinculadas a hojas de ruta, cobranzas y entregas territoriales.

---

# Descripción General

Las hojas de ruta representan la planificación diaria de trabajo de los cobradores.

Cada hoja agrupa:

* cobranzas
* entregas
* visitas
* recorridos

---

# Componentes de la Hoja de Ruta

* sociedad
* cobrador
* zona
* clientes asignados
* cobranzas pendientes
* entregas pendientes
* observaciones

---

# Reglas Generales

---

## BR-ROUTES-001

Toda hoja de ruta pertenece a una sociedad.

---

## BR-ROUTES-002

Toda hoja de ruta debe asignarse a un cobrador.

---

## BR-ROUTES-003

Las hojas de ruta se generan diariamente.

---

## BR-ROUTES-004

Una hoja puede contener:

* cobranzas
* entregas
* visitas programadas

---

## BR-ROUTES-005

Las entregas deben visualizarse como tareas operativas.

---

# Zonas

---

## BR-ROUTES-006

Las rutas deberán organizarse por zonas geográficas.

---

## BR-ROUTES-007

Un cobrador puede operar múltiples zonas.

---

## BR-ROUTES-008

La administración puede reasignar cobranzas manualmente.

---

# Visitas Frustradas

---

## BR-ROUTES-009

Las visitas frustradas deben registrarse obligatoriamente.

---

## BR-ROUTES-010

Las visitas frustradas podrán reprogramarse.

---

# Estados de Ruta

| Estado      | Descripción  |
| ----------- | ------------ |
| PENDING     | Pendiente    |
| IN_PROGRESS | En ejecución |
| COMPLETED   | Finalizada   |
| CANCELLED   | Cancelada    |

---

# Restricciones

* No se permiten hojas sin cobrador asignado.
* No se permiten rutas sin sociedad.
* No se permiten cobros fuera de ruta asignada.

---

# Consideraciones Operativas

* Los cobradores pueden ayudarse entre sí.
* Las asignaciones pueden cambiar diariamente.
* Las entregas poseen prioridad operativa.

---

# Consideraciones Técnicas

* Las hojas deben permitir futuras optimizaciones geográficas.

* El sistema deberá soportar filtros por:

  * zona
  * cobrador
  * sociedad
  * estado

* Toda modificación debe auditarse.

---

# Riesgos Operativos

* Asignaciones duplicadas
* Cobros incorrectos
* Entregas omitidas
* Desorganización territorial

---

# Auditoría

Registrar:

* usuario asignador
* fecha asignación
* modificaciones
* cambios de estado
* incidencias
