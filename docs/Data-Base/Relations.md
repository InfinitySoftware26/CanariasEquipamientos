# Canarias System — Database Relations

# Objetivo

Documentar las relaciones estructurales entre entidades del sistema.

Incluye:

* cardinalidades
* ownership
* foreign keys
* dependencias
* restricciones relacionales

---

# Convenciones

| Relación | Significado     |
| -------- | --------------- |
| 1:1      | Uno a uno       |
| 1:N      | Uno a muchos    |
| N:N      | Muchos a muchos |

---

# CORE BUSINESS DOMAIN

---

# SOCIETY

| Relación      | Tipo |
| ------------- | ---- |
| STAFF         | 1:N  |
| CLIENTS       | 1:N  |
| SALES         | 1:N  |
| PRODUCTS      | 1:N  |
| CASHBOX       | 1:1  |
| ROUTE_SHEETS  | 1:N  |
| FINANCING_CONFIGURATIONS | 1:N |
| FINANCING_PLANS | 1:N |
| PROMOTIONS    | 1:N  |
| NOTIFICATIONS | 1:N  |

---

# STAFF

| Relación        | Tipo |
| --------------- | ---- |
| STAFF_SOCIETIES | 1:N  |
| STAFF_ZONES     | 1:N  |
| SALES           | 1:N  |
| INSTALLMENTS    | 1:N  |
| ROUTE_SHEETS    | 1:N  |
| DAILY_CLOSURES  | 1:N  |
| SETTLEMENTS     | 1:N  |
| CASH_MOVEMENTS  | 1:N  |
| NOTIFICATIONS   | 1:N  |

---

# STAFF_SOCIETIES

| Relación | Tipo |
| -------- | ---- |
| STAFF    | N:1  |
| SOCIETY  | N:1  |

---

# STAFF_ZONES

| Relación | Tipo |
| -------- | ---- |
| STAFF    | N:1  |
| ZONES    | N:1  |

---

# USER_CONFIGURATIONS

| Relación | Tipo |
| -------- | ---- |
| STAFF    | 1:1  |

---

# ZONES

| Relación     | Tipo |
| ------------ | ---- |
| CLIENTS      | 1:N  |
| STAFF_ZONES  | 1:N  |
| ROUTE_SHEETS | 1:N  |

---

# CLIENTS

| Relación          | Tipo |
| ----------------- | ---- |
| SALES             | 1:N  |
| INSTALLMENTS      | 1:N  |
| RECEIPTS          | 1:N  |
| FAILED_VISITS     | 1:N  |
| ROUTE_SHEET_ITEMS | 1:N  |

---

# SALES

| Relación         | Tipo |
| ---------------- | ---- |
| CLIENTS          | N:1  |
| STAFF            | N:1  |
| SALE_VALIDATIONS | 1:N  |
| SALE_PRODUCTS    | 1:N  |
| INSTALLMENTS     | 1:N  |
| PAYMENTS         | 1:N  |
| FINANCING_PLANS  | N:1 (opcional) |
| PROMOTIONS       | N:1 (opcional) |

---

# SALE_VALIDATIONS

| Relación | Tipo |
| -------- | ---- |
| SALES    | N:1  |
| STAFF    | N:1  |

---

# SALE_PRODUCTS

| Relación | Tipo |
| -------- | ---- |
| SALES    | N:1  |
| PRODUCTS | N:1  |

---

# COLLECTIONS DOMAIN

---

# INSTALLMENTS

| Relación             | Tipo |
| -------------------- | ---- |
| SALES                | N:1  |
| CLIENTS              | N:1  |
| PAYMENTS             | N:N  |
| PAYMENT_INSTALLMENTS | 1:N  |
| ROUTE_SHEET_ITEMS    | 1:N  |

---

# PAYMENTS

| Relación             | Tipo |
| -------------------- | ---- |
| SALES                | N:1  |
| PAYMENT_INSTALLMENTS | 1:N  |
| RECEIPTS             | 1:N  |
| CASH_MOVEMENTS       | 1:N  |

---

# PAYMENT_INSTALLMENTS

| Relación     | Tipo |
| ------------ | ---- |
| PAYMENTS     | N:1  |
| INSTALLMENTS | N:1  |

---

# RECEIPTS

| Relación     | Tipo |
| ------------ | ---- |
| PAYMENTS     | N:1  |
| INSTALLMENTS | N:1  |
| CLIENTS      | N:1  |

---

# FAILED_VISITS

| Relación          | Tipo |
| ----------------- | ---- |
| CLIENTS           | N:1  |
| ROUTE_SHEET_ITEMS | N:1  |
| STAFF             | N:1  |

---

# ROUTES DOMAIN

---

# ROUTE_SHEETS

| Relación          | Tipo |
| ----------------- | ---- |
| STAFF             | N:1  |
| ZONES             | N:1  |
| ROUTE_SHEET_ITEMS | 1:N  |
| DAILY_CLOSURES    | 1:1  |

---

# ROUTE_SHEET_ITEMS

| Relación     | Tipo |
| ------------ | ---- |
| ROUTE_SHEETS | N:1  |
| CLIENTS      | N:1  |
| INSTALLMENTS | N:1  |
| SALES        | N:1  |

---

# DAILY_CLOSURES

| Relación     | Tipo |
| ------------ | ---- |
| STAFF        | N:1  |
| ROUTE_SHEETS | 1:1  |
| SETTLEMENTS  | 1:N  |

---

# SETTLEMENTS

| Relación       | Tipo |
| -------------- | ---- |
| DAILY_CLOSURES | N:1  |
| STAFF          | N:1  |

---

# FINANCIAL DOMAIN

---

# CASHBOX

| Relación       | Tipo |
| -------------- | ---- |
| CASH_MOVEMENTS | 1:N  |
| SOCIETY        | 1:1  |

---

# CASH_MOVEMENTS

| Relación | Tipo |
| -------- | ---- |
| CASHBOX  | N:1  |
| PAYMENTS | N:1  |
| RECEIPTS | N:1  |
| STAFF    | N:1  |

---

# FINANCING_CONFIGURATIONS

| Relación     | Tipo |
| ------------- | ---- |
| SOCIETY       | N:1  |
| PRODUCTS      | N:N  |
| FINANCING_PLANS | 1:N |

---

# FINANCING_PLANS

| Relación                | Tipo |
| -------------------------- | ---- |
| SOCIETY                    | N:1  |
| FINANCING_CONFIGURATIONS   | N:1  |
| PRODUCTS                   | N:N  |
| PROMOTIONS                 | 1:N  |
| SALES                      | 1:N  |

---

# PROMOTIONS

| Relación        | Tipo |
| ------------------ | ---- |
| SOCIETY            | N:1  |
| FINANCING_PLANS    | N:1 (opcional) |
| PRODUCTS           | N:N  |
| SALES              | 1:N  |

---

# STOCK DOMAIN

---

# PRODUCTS

| Relación                 | Tipo |
| --------------------------- | ---- |
| SUPPLIERS                   | N:1  |
| SALE_PRODUCTS                | 1:N  |
| FINANCING_CONFIGURATIONS     | N:N  |
| FINANCING_PLANS              | N:N  |
| PROMOTIONS                   | N:N  |

---

# SUPPLIERS

| Relación           | Tipo |
| ------------------ | ---- |
| PRODUCTS           | 1:N  |
| SUPPLIER_SOCIETIES | 1:N  |
| SUPPLIER_PAYMENTS  | 1:N  |

---

# SUPPLIER_SOCIETIES

| Relación  | Tipo |
| --------- | ---- |
| SUPPLIERS | N:1  |
| SOCIETY   | N:1  |

---

# SUPPLIER_PAYMENTS

| Relación  | Tipo |
| --------- | ---- |
| SUPPLIERS | N:1  |
| STAFF     | N:1  |

---

# NOTIFICATIONS DOMAIN

---

# NOTIFICATIONS

| Relación                | Tipo |
| ----------------------- | ---- |
| STAFF                   | N:1  |
| CLIENTS                 | N:1  |
| NOTIFICATION_DELIVERIES | 1:N  |

---

# NOTIFICATION_DELIVERIES

| Relación      | Tipo |
| ------------- | ---- |
| NOTIFICATIONS | N:1  |

---

# Consideraciones Técnicas

* todas las foreign keys deberán indexarse
* evitar cascadas destructivas en entidades financieras
* soft delete obligatorio en entidades críticas
* relaciones financieras deben ser auditables
* evitar eager loading excesivo
* utilizar lazy loading únicamente cuando sea necesario

---

# Estado Actual

Modelo relacional validado para fase inicial de desarrollo.
