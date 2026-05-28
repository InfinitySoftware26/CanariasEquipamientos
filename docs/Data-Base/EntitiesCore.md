# Canarias System — Entities Documentation

# Objetivo del Documento

Documentar todas las entidades del sistema Canarias System, incluyendo:

* propósito funcional
* estructura
* relaciones
* responsabilidades
* reglas importantes
* consideraciones técnicas

---

# Convenciones Globales

---

# IDs

Todas las entidades utilizarán:

```text
UUID
```

como primary key.

---

# Auditoría

Las entidades críticas deberán incluir:

```text
created_at
updated_at
deleted_at
created_by
updated_by
```

según corresponda.

---

# Multi-Sociedad

Las entidades operativas deberán incluir:

```text
society_id
```

para garantizar segmentación lógica.

---

# Naming Convention

## Base de Datos

```text
snake_case
```

## TypeScript

```text
camelCase
```

---

# Dominios del Sistema

El modelo relacional se divide en:

* Core
* Staff
* Ventas
* Cobranzas
* Rutas
* Caja
* Stock
* Configuración
* Notificaciones

---

# CORE ENTITIES

---

# SOCIETY

Representa una sociedad/empresa operativa dentro del ecosistema Canarias.

Ejemplos:

* Canarias 1
* Canarias 2
* Canarias Motos
* Canarias S.R.L.

---

## Responsabilidades

* segmentación operativa
* segmentación financiera
* aislamiento lógico
* administración independiente

---

## Campos

| Campo         | Tipo     | Descripción         |
| ------------- | -------- | ------------------- |
| society_id    | uuid     | Identificador único |
| name          | string   | Nombre comercial    |
| business_name | string   | Razón social        |
| tax_id        | string   | CUIT                |
| address       | string   | Dirección           |
| phone         | string   | Teléfono            |
| email         | string   | Correo              |
| created_at    | datetime | Fecha creación      |
| updated_at    | datetime | Fecha actualización |

---

## Relaciones

| Relación     | Tipo |
| ------------ | ---- |
| STAFF        | 1:N  |
| CLIENTS      | 1:N  |
| SALES        | 1:N  |
| CASHBOX      | 1:1  |
| ROUTE_SHEETS | 1:N  |

---

# USERS & ACCESS DOMAIN

---

# STAFF

Representa todos los usuarios operativos del sistema.

Incluye:

* administradores
* vendedores
* cobradores
* gerentes

---

## Responsabilidades

* autenticación
* operación diaria
* asignaciones
* auditoría
* trazabilidad

---

## Campos

| Campo       | Tipo     | Descripción                 |
| ----------- | -------- | --------------------------- |
| staff_id    | uuid     | Identificador único         |
| name        | string   | Nombre completo             |
| national_id | string   | Documento                   |
| address     | string   | Dirección                   |
| phone       | string   | Teléfono                    |
| email       | string   | Correo                      |
| role        | enum     | Rol sistema                 |
| society_id  | uuid     | Sociedad principal          |
| config_id   | uuid     | Configuración personalizada |
| hire_date   | date     | Fecha contratación          |
| notes       | string   | Observaciones               |
| created_at  | datetime | Fecha creación              |
| updated_at  | datetime | Fecha actualización         |

---

## Roles Iniciales

```text
ADMIN
SELLER
COLLECTOR
MANAGER
```

---

## Relaciones

| Relación     | Tipo |
| ------------ | ---- |
| SALES        | 1:N  |
| INSTALLMENTS | 1:N  |
| ROUTE_SHEETS | 1:N  |
| CLOUSES      | 1:N  |
| STAFF_ZONES  | 1:N  |

---

# STAFF_SOCIETIES

Tabla pivote para asignar múltiples sociedades a usuarios.

Permite:

* cobradores multi-sociedad
* administración compartida
* flexibilidad operativa

---

## Campos

| Campo            | Tipo     |
| ---------------- | -------- |
| staff_society_id | uuid     |
| staff_id         | uuid     |
| society_id       | uuid     |
| assigned_at      | datetime |
| status           | enum     |

---

# STAFF_ZONES

Asignación de zonas a cobradores/vendedores.

---

## Objetivos

* organización territorial
* generación rutas
* asignación operativa

---

## Campos

| Campo         | Tipo     |
| ------------- | -------- |
| staff_zone_id | uuid     |
| staff_id      | uuid     |
| zone_id       | uuid     |
| status        | enum     |
| assigned_at   | datetime |

---

# ZONES

Representa zonas operativas de cobranza.

Ejemplos:

* Rosario Centro
* Cordón Industrial
* Pueblo Andino

---

## Responsabilidades

* organización territorial
* generación hojas de ruta
* asignación cobradores

---

## Campos

| Campo       | Tipo     |
| ----------- | -------- |
| zone_id     | uuid     |
| society_id  | uuid     |
| name        | string   |
| description | string   |
| status      | enum     |
| created_at  | datetime |
| updated_at  | datetime |

---

# SALES DOMAIN

---

# CLIENTS

Representa clientes financiados del sistema.

---

## Responsabilidades

* información personal
* historial financiero
* seguimiento cobranza
* rutas operativas

---

## Campos

| Campo      | Tipo     |
| ---------- | -------- |
| client_id  | uuid     |
| dni        | number   |
| name       | string   |
| email      | string   |
| phone      | string   |
| address    | string   |
| zone_id    | uuid     |
| staff_id   | uuid     |
| society_id | uuid     |
| status     | enum     |
| created_at | datetime |
| updated_at | datetime |

---

## Reglas Importantes

* DNI único
* cliente asociado a sociedad
* cliente asociado a zona
* restricciones por mora

---

## Relaciones

| Relación          | Tipo |
| ----------------- | ---- |
| SALES             | 1:N  |
| INSTALLMENTS      | 1:N  |
| RECEIPTS          | 1:N  |
| ROUTE_SHEET_ITEMS | 1:N  |
| FAILED_VISITS     | 1:N  |

---

# SALES

Representa ventas financiadas realizadas por vendedores.

---

## Responsabilidades

* venta financiada
* cálculo cuotas
* estado comercial
* workflow aprobación

---

## Campos

| Campo        | Tipo     |
| ------------ | -------- |
| sale_id      | uuid     |
| client_id    | uuid     |
| staff_id     | uuid     |
| society_id   | uuid     |
| payment_type | enum     |
| total_amount | decimal  |
| sale_date    | datetime |
| status       | enum     |
| created_at   | datetime |
| updated_at   | datetime |

---

## Estados Recomendados

```text
PENDING
UNDER_REVIEW
APPROVED
REJECTED
DELIVERED
ACTIVE
CLOSED
DEFAULTED
```

---

## Reglas Negocio

* venta requiere validación administrativa
* validación ambiental obligatoria
* entrega genera cobranza
* primera cuota puede cobrarse en entrega

---

# SALE_VALIDATIONS

Representa validaciones administrativas sobre ventas.

---

## Objetivos

* aprobación administrativa
* auditoría validaciones
* observaciones ambientales

---

## Campos

| Campo         | Tipo     |
| ------------- | -------- |
| validation_id | uuid     |
| sale_id       | uuid     |
| staff_id      | uuid     |
| step          | enum     |
| status        | enum     |
| observations  | text     |
| validated_at  | datetime |
| created_at    | datetime |
| updated_at    | datetime |

---
