# Canarias System — Routes API

# Objetivo

Documentar el módulo de hojas de ruta y operación diaria.

El módulo será responsable de:

* generación hojas ruta
* asignación cobranzas
* asignación entregas
* recorridos cobradores
* visitas fallidas
* cierres diarios
* liquidaciones cobradores

---

# Endpoint Base

```http id="j2wjlwm"
/api/v1/routes
```

---

# Roles Permitidos

| Rol       | Acceso    |
| --------- | --------- |
| ADMIN     | Completo  |
| COLLECTOR | Operativo |
| MANAGER   | Lectura   |

---

# Estados Hoja Ruta

| Estado      | Descripción                 |
| ----------- | --------------------------- |
| PENDING     | Pendiente                   |
| IN_PROGRESS | En recorrido                |
| COMPLETED   | Finalizada                  |
| CLOSED      | Cerrada administrativamente |

---

# Endpoints

---

# Crear Hoja Ruta

## Endpoint

```http id="jlwm13"
POST /routes
```

---

# Roles

* ADMIN

---

# Objetivo

Generar hoja de ruta diaria.

---

# Request

```json id="jlwm14"
{
  "societyId": "uuid",
  "collectorId": "uuid",
  "zoneId": "uuid",
  "routeDate": "2026-05-28"
}
```

---

# Resultado Operativo

La hoja incluirá automáticamente:

* cobranzas pendientes
* entregas pendientes
* clientes asignados

---

# Obtener Hojas Ruta

## Endpoint

```http id="jlwm15"
GET /routes
```

---

# Query Params

| Parámetro   | Tipo   |
| ----------- | ------ |
| collectorId | uuid   |
| societyId   | uuid   |
| routeDate   | date   |
| status      | string |

---

# Obtener Hoja Ruta

## Endpoint

```http id="jlwm16"
GET /routes/:id
```

---

# Información Incluida

* cobrador
* clientes
* cuotas
* entregas
* recorridos
* estado operativo

---

# Asignar Item Ruta

## Endpoint

```http id="jlwm17"
POST /routes/:id/items
```

---

# Objetivo

Agregar manualmente:

* cobranza
* entrega
* visita

---

# Marcar Cobranza Realizada

## Endpoint

```http id="jlwm18"
POST /routes/items/:id/collect
```

---

# Resultado

* registra pago
* actualiza cuota
* impacta cierre

---

# Marcar Entrega Realizada

## Endpoint

```http id="jlwm19"
POST /routes/items/:id/deliver
```

---

# Resultado

* venta pasa a DELIVERED
* entrega auditada

---

# Registrar Visita Fallida

## Endpoint

```http id="jlwm20"
POST /routes/items/:id/failed-visit
```

---

# Request

```json id="jlwm21"
{
  "reason": "Cliente ausente",
  "observations": "Volver mañana"
}
```

---

# Resultado

Genera:

```text id="jlwm22"
failed_visit
```

---

# Iniciar Recorrido

## Endpoint

```http id="jlwm23"
POST /routes/:id/start
```

---

# Finalizar Recorrido

## Endpoint

```http id="jlwm24"
POST /routes/:id/finish
```

---

# Cierre Diario

## Endpoint

```http id="jlwm25"
POST /routes/:id/daily-closure
```

---

# Roles

* COLLECTOR

---

# Objetivo

Registrar cierre operativo diario cobrador.

---

# Request

```json id="jlwm26"
{
  "cashAmount": 150000,
  "observations": "Recorrido completo"
}
```

---

# Resultado Operativo

* genera daily_closure
* pendiente aprobación admin
* bloquea modificaciones posteriores

---

# Aprobar Cierre Diario

## Endpoint

```http id="jlwm27"
POST /routes/daily-closures/:id/approve
```

---

# Roles

* ADMIN

---

# Resultado

* cierre aprobado
* dinero validado
* impacta caja sociedad

---

# Reglas Negocio

---

# Hojas Ruta

* una hoja pertenece a un cobrador
* una hoja pertenece a una sociedad
* una hoja puede incluir cobranzas y entregas

---

# Asignaciones

Administración podrá:

* reasignar cobranzas
* reasignar entregas
* mover zonas

---

# Auditoría

Registrar:

* recorridos
* cierres
* entregas
* cobranzas
* visitas fallidas

---

# Seguridad

* JWT obligatorio
* permisos por rol
* filtrado sociedad

---

# Escalabilidad Futura

Preparado para:

* GPS
* tracking tiempo real
* optimización rutas
* mapas
* app mobile cobradores
* offline mode

---

# Estado Actual

Módulo aprobado para Fase 1.
