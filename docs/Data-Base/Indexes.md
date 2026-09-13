# Canarias System — Database Indexes

# Objetivo

Documentar la estrategia de indexación del sistema Canarias System.

Los índices permitirán:

* optimizar consultas
* mejorar performance
* soportar escalabilidad
* acelerar dashboards
* reducir tiempos de respuesta
* optimizar reportes operativos

---

# Estrategia General

Todos los:

* foreign keys
* campos búsqueda
* filtros frecuentes
* dashboards
* reportes
* consultas operativas

deberán poseer índices adecuados.

---

# Reglas Generales

## Indexar Foreign Keys

Toda foreign key deberá poseer índice.

Ejemplos:

```sql
client_id
sale_id
staff_id
society_id
product_id
payment_id
```

---

# Evitar Over Indexing

No crear índices innecesarios.

Cada índice:

* consume memoria
* afecta inserts
* afecta updates
* aumenta costo mantenimiento

---

# Revisar Métricas Reales

Los índices deberán ajustarse según:

* métricas producción
* consultas lentas
* planes ejecución
* crecimiento datos

---

# Índices por Dominio

---

# CORE BUSINESS DOMAIN

---

# SOCIETIES

## Índices

| Campo         | Tipo  |
| ------------- | ----- |
| business_name | INDEX |
| is_active     | INDEX |

---

# STAFF

## Índices

| Campo      | Tipo   |
| ---------- | ------ |
| email      | UNIQUE |
| role       | INDEX  |
| society_id | INDEX  |
| is_active  | INDEX  |

---

# STAFF_SOCIETIES

## Índices

| Campo      | Tipo  |
| ---------- | ----- |
| staff_id   | INDEX |
| society_id | INDEX |

---

# STAFF_ZONES

## Índices

| Campo    | Tipo  |
| -------- | ----- |
| staff_id | INDEX |
| zone_id  | INDEX |

---

# USER_CONFIGURATIONS

## Índices

| Campo    | Tipo   |
| -------- | ------ |
| staff_id | UNIQUE |

---

# ZONES

## Índices

| Campo      | Tipo  |
| ---------- | ----- |
| society_id | INDEX |
| is_active  | INDEX |

---

# SALES DOMAIN

---

# CLIENTS

## Índices

| Campo      | Tipo   |
| ---------- | ------ |
| dni        | UNIQUE |
| society_id | INDEX  |
| zone_id    | INDEX  |
| seller_id  | INDEX  |
| status     | INDEX  |

---

## Índices Compuestos

```sql
(society_id, status)
(zone_id, status)
```

---

# SALES

## Índices

| Campo      | Tipo  |
| ---------- | ----- |
| client_id  | INDEX |
| seller_id  | INDEX |
| society_id | INDEX |
| sale_date  | INDEX |
| status     | INDEX |

---

## Índices Compuestos

```sql
(society_id, sale_date)
(status, sale_date)
```

---

# SALE_PRODUCTS

## Índices

| Campo      | Tipo  |
| ---------- | ----- |
| sale_id    | INDEX |
| product_id | INDEX |

---

# SALE_VALIDATIONS

## Índices

| Campo              | Tipo  |
| ------------------ | ----- |
| sale_id            | INDEX |
| validator_staff_id | INDEX |
| validation_status  | INDEX |

---

# COLLECTIONS DOMAIN

---

# INSTALLMENTS

## Índices Críticos

| Campo        | Tipo  |
| ------------ | ----- |
| sale_id      | INDEX |
| client_id    | INDEX |
| collector_id | INDEX |
| due_date     | INDEX |
| status       | INDEX |
| society_id   | INDEX |

---

## Índices Compuestos

```sql
(status, due_date)
(client_id, status)
(society_id, status)
(collector_id, due_date)
```

---

# PAYMENTS

## Índices

| Campo          | Tipo  |
| -------------- | ----- |
| sale_id        | INDEX |
| payment_date   | INDEX |
| society_id     | INDEX |
| payment_method | INDEX |

---

# PAYMENT_INSTALLMENTS

## Índices

| Campo          | Tipo  |
| -------------- | ----- |
| payment_id     | INDEX |
| installment_id | INDEX |

---

# RECEIPTS

## Índices

| Campo          | Tipo   |
| -------------- | ------ |
| client_id      | INDEX  |
| payment_id     | INDEX  |
| receipt_number | UNIQUE |

---

# FAILED_VISITS

## Índices

| Campo               | Tipo  |
| ------------------- | ----- |
| client_id           | INDEX |
| route_sheet_item_id | INDEX |
| collector_id        | INDEX |
| created_at          | INDEX |

---

# ROUTES DOMAIN

---

# ROUTE_SHEETS

## Índices

| Campo        | Tipo  |
| ------------ | ----- |
| collector_id | INDEX |
| society_id   | INDEX |
| zone_id      | INDEX |
| route_date   | INDEX |
| status       | INDEX |

---

## Índices Compuestos

```sql
(collector_id, route_date)
(zone_id, route_date)
(society_id, route_date)
```

---

# ROUTE_SHEET_ITEMS

## Índices

| Campo          | Tipo  |
| -------------- | ----- |
| route_sheet_id | INDEX |
| client_id      | INDEX |
| installment_id | INDEX |
| sale_id        | INDEX |

---

# DAILY_CLOSURES

## Índices

| Campo        | Tipo  |
| ------------ | ----- |
| collector_id | INDEX |
| society_id   | INDEX |
| closing_date | INDEX |
| status       | INDEX |

---

# SETTLEMENTS

## Índices

| Campo           | Tipo  |
| --------------- | ----- |
| closure_id      | INDEX |
| collector_id    | INDEX |
| settlement_date | INDEX |

---

# FINANCIAL DOMAIN

---

# CASHBOX

## Índices

| Campo      | Tipo   |
| ---------- | ------ |
| society_id | UNIQUE |

---

# CASH_MOVEMENTS

## Índices

| Campo         | Tipo  |
| ------------- | ----- |
| cashbox_id    | INDEX |
| payment_id    | INDEX |
| receipt_id    | INDEX |
| movement_date | INDEX |
| movement_type | INDEX |

---

## Índices Compuestos

```sql
(cashbox_id, movement_date)
(movement_type, movement_date)
```

---

# FINANCING CONFIGURATIONS DOMAIN

---

# FINANCING_CONFIGURATIONS

## Índices

| Campo      | Tipo  |
| ---------- | ----- |
| society_id | INDEX |
| (society_id, lower(name)) | UNIQUE |

---

# FINANCING_PLANS

## Índices

| Campo               | Tipo  |
| --------------------- | ----- |
| society_id            | INDEX |
| financing_config_id   | INDEX |
| (society_id, lower(name)) | UNIQUE |

---

# PROMOTIONS

## Índices

| Campo               | Tipo  |
| --------------------- | ----- |
| society_id            | INDEX |
| financing_plan_id     | INDEX |
| (society_id, is_active) | INDEX |
| (society_id, lower(name)) | UNIQUE |

---

# STOCK DOMAIN

---

# PRODUCTS

## Índices

| Campo                      | Tipo  |
| -------------------------- | ----- |
| supplier_id                | INDEX |
| category                   | INDEX |
| status                     | INDEX |

---

# SUPPLIERS

## Índices

| Campo         | Tipo   |
| ------------- | ------ |
| tax_id        | UNIQUE |
| business_name | INDEX  |

---

# SUPPLIER_SOCIETIES

## Índices

| Campo       | Tipo  |
| ----------- | ----- |
| supplier_id | INDEX |
| society_id  | INDEX |

---

# SUPPLIER_PAYMENTS

## Índices

| Campo        | Tipo  |
| ------------ | ----- |
| supplier_id  | INDEX |
| payment_date | INDEX |

---

# NOTIFICATIONS DOMAIN

---

# NOTIFICATIONS

## Índices

| Campo      | Tipo  |
| ---------- | ----- |
| staff_id   | INDEX |
| client_id  | INDEX |
| status     | INDEX |
| type       | INDEX |
| created_at | INDEX |

---

# NOTIFICATION_DELIVERIES

## Índices

| Campo           | Tipo  |
| --------------- | ----- |
| notification_id | INDEX |
| delivery_status | INDEX |

---

# Full Text Search (Futuro)

Para futuras mejoras de búsqueda:

```sql
clients.full_name
products.name
suppliers.business_name
```

---

# Consideraciones Técnicas

* evitar eager loading excesivo
* revisar queries lentas periódicamente
* optimizar dashboards mediante agregaciones
* monitorear crecimiento índices
* mantener consistencia entre ambientes

---

# Objetivo Arquitectónico

Garantizar:

* performance operativa
* escalabilidad
* estabilidad
* rapidez consultas
* soporte crecimiento futuro

---

# Estado Actual

Estrategia inicial de indexación aprobada para fase de desarrollo.
