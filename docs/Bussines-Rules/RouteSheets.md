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

## BR-ROUTES-011

La generación automática (`POST /route-sheets/generate` y el proceso diario) incorpora a la hoja de la fecha, por zona y cobrador:

- entregas coordinadas para esa fecha;
- reintentos de entregas fallidas desde el día siguiente a la visita, para la misma zona y el mismo cobrador;
- la cuota abierta más antigua de cada venta CLOSED con cobrador asignado, siempre que `vencimiento <= fecha de la hoja` y la fecha coincida con la modalidad de cobranza (día fijo semanal o fecha ancla de rango mensual).

Reglas asociadas:

- La cuota 1 pertenece al flujo de entrega y no se incluye como cobranza.
- No se duplica una cuota ya incluida en una hoja activa.
- Si ya existe una hoja activa para cobrador, zona y fecha, se completa en lugar de crear otra.

---

## BR-ROUTES-012

Una hoja creada manualmente (`POST /route-sheets`) puede incorporar automáticamente reintentos de entregas fallidas pendientes para su zona y cobrador. Las cuotas se incorporan con la generación automática o con "Agregar cuota" (`POST /route-sheets/:id/installments`).

Al registrar una entrega fallida, si ya existe una hoja posterior pendiente o en curso para la misma zona y cobrador, se intenta incorporarla a la más próxima. Si no existe, el reintento puede incorporarse al generar una hoja posterior. Una entrega pendiente muestra que hubo una visita fallida anterior.

El registro de la falla y la incorporación del reintento son operaciones separadas. La comprobación de entregas activas evita duplicados en el flujo secuencial, pero no garantiza exclusión ante solicitudes concurrentes.

---

## BR-ROUTES-013

Los importes de cada ítem se resuelven desde la cuota asociada: importe original, capital pendiente (saldo de la cuota), mora y total a cobrar (capital + mora).

---

## BR-ROUTES-014

En el registro de visita fallida, el motivo se elige con el selector estándar del sistema (cliente ausente, rechazó el pago, domicilio incorrecto, otro). El monto recibido se ingresa con formato de dinero (separador de miles).

En entregas fallidas registradas desde la hoja, el código del motivo se guarda en el intento de entrega y las observaciones en el ítem de la hoja. En cobranzas, el motivo y las observaciones se guardan en la visita fallida.

Las confirmaciones destructivas usan el diálogo estándar del sistema (`ConfirmDialog`) y no el `confirm()` nativo del navegador. Aplica a "Quitar de la hoja" (solo ítems pendientes) y a "Desactivar" cliente.

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
