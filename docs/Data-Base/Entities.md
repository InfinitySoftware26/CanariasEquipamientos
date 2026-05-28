# Canarias System — Entities Documentation

# Objetivo del Documento

Este documento representa la definición oficial del modelo relacional y dominio operativo del sistema Canarias System.

Incluye:

* entidades
* responsabilidades
* relaciones principales
* reglas estructurales
* segmentación por dominios
* consideraciones técnicas

---

# Propósito

Centralizar la documentación funcional y técnica utilizada por:

* backend
* frontend
* arquitectura
* testing
* futuras integraciones
* futura migración a microservicios

---

# Convenciones Globales

## Primary Keys

Todas las entidades utilizarán:

```text
UUID
```

como identificador principal.

---

## Auditoría

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

## Naming Convention

### Base de Datos

```text
snake_case
```

### TypeScript

```text
camelCase
```

---

## Multi-Sociedad

Las entidades operativas deberán incluir:

```text
society_id
```

para garantizar segmentación lógica.

---

# Organización de Entidades

Las entidades fueron organizadas por dominios funcionales siguiendo principios de modularidad y separación de responsabilidades.

La estructura facilita:

* mantenibilidad
* escalabilidad
* desacoplamiento
* evolución futura a microservicios

---

# Dominios Principales

## Core Business Domain

* society
* staff
* staff_societies
* staff_zones
* user_configurations
* zones
* clients
* sales
* sale_validations
* sale_products

---

## Collections Domain

* installments
* payments
* payment_installments
* receipts
* failed_visits

---

## Routes Domain

* route_sheets
* route_sheet_items
* daily_closures
* settlements

---

## Financial Domain

* cashbox
* cash_movements
* financing

---

## Stock Domain

* products
* suppliers
* supplier_societies
* supplier_payments

---

## Notifications Domain

* notifications
* notification_deliveries

---

# CORE BUSINESS DOMAIN

---

# SOCIETY

Representa una sociedad/empresa operativa dentro del ecosistema Canarias.

Ejemplos:

* Canarias 1
* Canarias 2
* Canarias Motos
* Canarias S.R.L.

## Campos

| Campo         | Tipo     |
| ------------- | -------- |
| society_id    | uuid     |
| name          | string   |
| business_name | string   |
| tax_id        | string   |
| address       | string   |
| phone         | string   |
| email         | string   |
| created_at    | datetime |
| updated_at    | datetime |

---

# STAFF

Representa empleados internos del sistema.

Incluye:

* administradores
* cobradores
* vendedores
* gerentes

## Campos

| Campo       | Tipo     |
| ----------- | -------- |
| staff_id    | uuid     |
| name        | string   |
| national_id | string   |
| address     | string   |
| phone       | string   |
| email       | string   |
| password    | string   |
| role        | enum     |
| society_id  | uuid     |
| config_id   | uuid     |
| hire_date   | date     |
| status      | enum     |
| notes       | string   |
| created_at  | datetime |
| updated_at  | datetime |

---

# STAFF_SOCIETIES

Tabla pivote para asignar múltiples sociedades a empleados.

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

Asignación de zonas operativas.

## Campos

| Campo         | Tipo     |
| ------------- | -------- |
| staff_zone_id | uuid     |
| staff_id      | uuid     |
| zone_id       | uuid     |
| status        | enum     |
| assigned_at   | datetime |

---

# USER_CONFIGURATIONS

Configuraciones personalizadas por usuario interno.

## Campos

| Campo                 | Tipo     |
| --------------------- | -------- |
| config_id             | uuid     |
| staff_id              | uuid     |
| theme                 | enum     |
| language              | string   |
| notifications_enabled | boolean  |
| created_at            | datetime |
| updated_at            | datetime |

---

# ZONES

Representa zonas operativas de cobranza.

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

# CLIENTS

Representa clientes financiados del sistema.

## Campos

| Campo      | Tipo     |
| ---------- | -------- |
| client_id  | uuid     |
| dni        | string   |
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

# SALES

Representa ventas financiadas realizadas por vendedores.

## Campos

| Campo        | Tipo     |
| ------------ | -------- |
| sale_id      | uuid     |
| client_id    | uuid     |
| staff_id     | uuid     |
| society_id   | uuid     |
| payment_type | enum     |
| total_amount | decimal  |
| status       | enum     |
| sale_date    | datetime |
| created_at   | datetime |
| updated_at   | datetime |

---

# SALE_VALIDATIONS

Validaciones administrativas y ambientales.

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

# SALE_PRODUCTS

Productos asociados a ventas.

## Campos

| Campo           | Tipo     |
| --------------- | -------- |
| sale_product_id | uuid     |
| sale_id         | uuid     |
| product_id      | uuid     |
| quantity        | integer  |
| unit_price      | decimal  |
| total_price     | decimal  |
| status          | enum     |
| created_at      | datetime |
| updated_at      | datetime |

---

# COLLECTIONS DOMAIN

---

# INSTALLMENTS

Cuotas generadas a partir de ventas financiadas.

## Campos

| Campo              | Tipo     |
| ------------------ | -------- |
| installment_id     | uuid     |
| sale_id            | uuid     |
| client_id          | uuid     |
| amount             | decimal  |
| paid_amount        | decimal  |
| remaining_amount   | decimal  |
| installment_number | integer  |
| due_date           | datetime |
| payment_frequency  | enum     |
| status             | enum     |
| staff_id           | uuid     |
| society_id         | uuid     |
| notes              | string   |
| created_at         | datetime |
| updated_at         | datetime |

---

# PAYMENTS

Pagos realizados por clientes.

## Campos

| Campo                | Tipo     |
| -------------------- | -------- |
| payment_id           | uuid     |
| sale_id              | uuid     |
| amount               | decimal  |
| payment_date         | datetime |
| payment_time         | time     |
| method               | enum     |
| status               | enum     |
| transfer_holder_name | string   |
| transfer_bank        | string   |
| transfer_reference   | string   |
| society_id           | uuid     |
| created_at           | datetime |
| updated_at           | datetime |

---

# PAYMENT_INSTALLMENTS

Relación pagos-cuotas para soportar pagos parciales y múltiples cuotas.

## Campos

| Campo                  | Tipo     |
| ---------------------- | -------- |
| payment_installment_id | uuid     |
| payment_id             | uuid     |
| installment_id         | uuid     |
| amount_applied         | decimal  |
| observation            | string   |
| created_at             | datetime |
| updated_at             | datetime |

---

# RECEIPTS

Comprobantes emitidos por cobranzas.

## Campos

| Campo          | Tipo     |
| -------------- | -------- |
| receipt_id     | uuid     |
| payment_id     | uuid     |
| installment_id | uuid     |
| client_id      | uuid     |
| amount         | decimal  |
| issued_date    | datetime |
| issued_time    | time     |
| status         | enum     |
| society_id     | uuid     |
| created_at     | datetime |
| updated_at     | datetime |

---

# FAILED_VISITS

Visitas de cobranza fallidas.

## Campos

| Campo               | Tipo     |
| ------------------- | -------- |
| failed_visit_id     | uuid     |
| route_sheet_item_id | uuid     |
| client_id           | uuid     |
| staff_id            | uuid     |
| society_id          | uuid     |
| visit_date          | datetime |
| attempt_number      | integer  |
| notes               | text     |
| notified_admin      | boolean  |
| created_at          | datetime |
| updated_at          | datetime |

---

# ROUTES DOMAIN

---

# ROUTE_SHEETS

Hojas de ruta diarias de cobranza y entrega.

## Campos

| Campo          | Tipo     |
| -------------- | -------- |
| route_sheet_id | uuid     |
| society_id     | uuid     |
| zone_id        | uuid     |
| staff_id       | uuid     |
| assigned_by    | uuid     |
| route_date     | date     |
| status         | enum     |
| notes          | text     |
| created_at     | datetime |
| updated_at     | datetime |

---

# ROUTE_SHEET_ITEMS

Items individuales dentro de hojas de ruta.

## Campos

| Campo          | Tipo     |
| -------------- | -------- |
| item_id        | uuid     |
| route_sheet_id | uuid     |
| client_id      | uuid     |
| installment_id | uuid     |
| sale_id        | uuid     |
| item_type      | enum     |
| result         | enum     |
| notes          | text     |
| visited_at     | datetime |
| created_at     | datetime |
| updated_at     | datetime |

---

# DAILY_CLOSURES

Cierres diarios realizados por cobradores.

## Campos

| Campo           | Tipo     |
| --------------- | -------- |
| closure_id      | uuid     |
| staff_id        | uuid     |
| validated_by    | uuid     |
| society_id      | uuid     |
| closing_date    | date     |
| total_collected | decimal  |
| status          | enum     |
| notes           | string   |
| created_at      | datetime |
| updated_at      | datetime |

---

# SETTLEMENTS

Rendiciones financieras de cobradores.

## Campos

| Campo            | Tipo     |
| ---------------- | -------- |
| settlement_id    | uuid     |
| closure_id       | uuid     |
| staff_id         | uuid     |
| society_id       | uuid     |
| settlement_date  | date     |
| amount_due       | decimal  |
| amount_collected | decimal  |
| outstanding_debt | decimal  |
| status           | enum     |
| notes            | string   |
| created_at       | datetime |
| updated_at       | datetime |

---

# FINANCIAL DOMAIN

---

# FINANCING_CONFIGURATIONS

Configuraciones de financiación.

## Campos

| Campo                 | Tipo     |
| --------------------- | -------- |
| financing_id          | uuid     |
| product_id            | uuid     |
| society_id            | uuid     |
| installments_count    | integer  |
| interest_rate         | decimal  |
| seller_commission_pct | decimal  |
| is_global             | boolean  |
| created_at            | datetime |
| updated_at            | datetime |

# Configuración Financiera Global

El sistema permite definir configuraciones financieras globales por sociedad.

Estas configuraciones incluyen:

* cantidad de cuotas
* interés financiero
* comisión vendedor
* frecuencia pagos
* reglas financieras generales

---

# Aplicación de Configuración

## Comportamiento por defecto

Todos los productos utilizarán automáticamente la configuración financiera global activa de su sociedad.

---

# Configuración Especial por Producto

Opcionalmente un producto podrá asociarse a una configuración financiera específica.

Esto permitirá:

* promociones especiales
* financiación diferenciada
* productos premium
* campañas comerciales
* planes especiales

---

# Prioridad de Resolución

El sistema resolverá la financiación en el siguiente orden:

## 1. Configuración específica producto

Si el producto posee:

```text
financing_configuration_id
```

se utilizará dicha configuración.

---

## 2. Configuración global sociedad

Si el producto NO posee configuración específica:

```text
financing_configuration_id = NULL
```

el sistema utilizará automáticamente la configuración financiera global activa de la sociedad.

---

# Objetivo Arquitectónico

Este modelo permite:

* minimizar duplicación
* centralizar configuración
* soportar overrides
* mejorar mantenibilidad
* facilitar escalabilidad futura


---

# CASHBOX

Caja operativa por sociedad.

## Campos

| Campo           | Tipo     |
| --------------- | -------- |
| cashbox_id      | uuid     |
| society_id      | uuid     |
| opening_balance | decimal  |
| current_balance | decimal  |
| status          | enum     |
| opened_at       | datetime |
| closed_at       | datetime |
| created_at      | datetime |
| updated_at      | datetime |

---

# CASH_MOVEMENTS

Movimientos financieros de caja.

## Campos

| Campo         | Tipo     |
| ------------- | -------- |
| movement_id   | uuid     |
| cashbox_id    | uuid     |
| staff_id      | uuid     |
| type          | enum     |
| amount        | decimal  |
| description   | string   |
| movement_date | datetime |
| payment_id    | uuid     |
| receipt_id    | uuid     |

---

# STOCK DOMAIN

---

# PRODUCTS

Productos comercializados.

## Campos

| Campo         | Tipo     |
| ------------- | -------- |
| product_id    | uuid     |
| name          | string   |
| brand         | string   |
| model         | string   |
| serial_number | string   |
| supplier_id   | uuid     |
| price         | decimal  |
| cost_price    | decimal  |
| origin        | enum     |
| stock         | integer  |
| category      | string   |
| description   | string   |
| status        | enum     |
| order_date    | datetime |
| society_id    | uuid     |
| created_at    | datetime |
| updated_at    | datetime |

---

# SUPPLIERS

Proveedores comerciales.

## Campos

| Campo         | Tipo     |
| ------------- | -------- |
| supplier_id   | uuid     |
| tax_id        | string   |
| business_name | string   |
| contact_name  | string   |
| address       | string   |
| phone         | string   |
| email         | string   |
| status        | enum     |
| created_at    | datetime |
| updated_at    | datetime |

---

# SUPPLIER_SOCIETIES

Relación proveedores-sociedades.

## Campos

| Campo               | Tipo     |
| ------------------- | -------- |
| supplier_society_id | uuid     |
| supplier_id         | uuid     |
| society_id          | uuid     |
| status              | enum     |
| assigned_at         | datetime |

---

# SUPPLIER_PAYMENTS

Pagos realizados a proveedores.

## Campos

| Campo               | Tipo     |
| ------------------- | -------- |
| supplier_payment_id | uuid     |
| supplier_id         | uuid     |
| society_id          | uuid     |
| amount              | decimal  |
| payment_date        | datetime |
| method              | enum     |
| status              | enum     |
| reference           | string   |
| staff_id            | uuid     |
| notes               | string   |
| created_at          | datetime |
| updated_at          | datetime |

---

# NOTIFICATIONS DOMAIN

---

# NOTIFICATIONS

Sistema centralizado de notificaciones internas y externas.

## Campos

| Campo           | Tipo     |
| --------------- | -------- |
| notification_id | uuid     |
| society_id      | uuid     |
| staff_id        | uuid     |
| client_id       | uuid     |
| type            | enum     |
| title           | string   |
| message         | text     |
| priority        | enum     |
| status          | enum     |
| entity_type     | string   |
| entity_id       | uuid     |
| is_read         | boolean  |
| read_at         | datetime |
| created_at      | datetime |

---

# NOTIFICATION_DELIVERIES

Trazabilidad de envíos de notificaciones.

## Campos

| Campo           | Tipo     |
| --------------- | -------- |
| delivery_id     | uuid     |
| notification_id | uuid     |
| channel         | enum     |
| status          | enum     |
| recipient       | string   |
| sent_at         | datetime |
| delivered_at    | datetime |
| failed_at       | datetime |
| error_message   | string   |
| created_at      | datetime |

---

# Consideraciones Técnicas Globales

* soft delete obligatorio en entidades críticas
* índices obligatorios en foreign keys
* auditoría obligatoria operaciones financieras
* segmentación obligatoria por sociedad
* validaciones críticas exclusivamente backend
* exceptions centralizadas mediante GlobalExceptionFilter
* arquitectura preparada para futura migración a microservicios
* arquitectura basada en monolito modular escalable

---

# Estado Actual

Modelo relacional consolidado y aprobado para inicio desarrollo fase operativa.
