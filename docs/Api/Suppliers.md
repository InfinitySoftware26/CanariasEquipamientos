# Canarias System — Suppliers API

## 1. Objetivo

Documentar las APIs actualmente implementadas para la gestión de:

* proveedores;
* facturas de proveedores;
* pagos a proveedores;
* imputaciones de pagos;
* deuda de proveedores.

El dominio se encuentra dividido en tres recursos:

```text
/suppliers
/supplier-invoices
/supplier-payments
```

---

# 2. Seguridad

Todos los endpoints utilizan:

```text
JwtAuthGuard
RolesGuard
SocietyGuard
```

Las operaciones administrativas requieren:

```text
ADMIN
MANAGER
SUPER_ADMIN
```

La sociedad se obtiene desde:

```ts
user.societyId
```

No se debe enviar `societyId` como parámetro para seleccionar otra sociedad.

---

# 3. Suppliers

## 3.1. Listar proveedores

```http
GET /suppliers
```

### Query Params

| Parámetro  | Tipo    | Obligatorio |
| ---------- | ------- | ----------- |
| activeOnly | boolean | No          |

Ejemplo:

```http
GET /suppliers?activeOnly=true
```

La consulta utiliza la sociedad del usuario autenticado.

---

## 3.2. Obtener proveedor

```http
GET /suppliers/:id
```

### Parámetro

| Parámetro | Tipo |
| --------- | ---- |
| id        | UUID |

Devuelve el detalle del proveedor.

---

## 3.3. Crear proveedor

```http
POST /suppliers
```

### Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

### Body

```json
{
  "name": "Distribuidora del Sur S.A.",
  "taxId": "30-12345678-9",
  "phone": "3870000000",
  "email": "contacto@proveedor.com",
  "address": "Av. Ejemplo 123"
}
```

### Campos

| Campo   | Tipo   | Obligatorio |
| ------- | ------ | ----------- |
| name    | string | Sí          |
| taxId   | string | No          |
| phone   | string | No          |
| email   | string | No          |
| address | string | No          |

El proveedor se crea asociado a:

```text
user.societyId
```

y comienza como activo.

---

# 4. Actualizar proveedor

```http
PATCH /suppliers/:id
```

### Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

Todos los campos del DTO de creación son opcionales durante la actualización.

Respuesta:

```http
204 No Content
```

---

# 5. Desactivar proveedor

```http
DELETE /suppliers/:id
```

### Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

La operación no elimina físicamente el proveedor.

Lo establece como:

```text
active = false
```

Respuesta:

```http
204 No Content
```

---

# 6. Supplier Invoices

Las facturas de proveedores utilizan el recurso:

```http
/supplier-invoices
```

---

## 6.1. Listar facturas

```http
GET /supplier-invoices
```

### Query Params

| Parámetro  | Tipo       | Obligatorio |
| ---------- | ---------- | ----------- |
| supplierId | UUID       | No          |
| status     | enum       | No          |
| from       | YYYY-MM-DD | No          |
| to         | YYYY-MM-DD | No          |

Estados disponibles:

```text
pending
partially_paid
paid
cancelled
```

---

# 7. Obtener factura

```http
GET /supplier-invoices/:id
```

### Parámetro

```text
id = UUID
```

---

# 8. Saldo de factura

```http
GET /supplier-invoices/:id/balance
```

Devuelve:

```json
{
  "invoiceId": "uuid",
  "totalAmount": 120000,
  "paidAmount": 50000,
  "balance": 70000,
  "status": "partially_paid"
}
```

---

# 9. Aplicaciones de una factura

```http
GET /supplier-invoices/:id/applications
```

Devuelve los pagos imputados a la factura.

---

# 10. Deuda de proveedor

```http
GET /supplier-invoices/supplier/:supplierId/debt
```

Devuelve:

```json
{
  "supplierId": "uuid",
  "totalInvoiced": 500000,
  "totalPaid": 300000,
  "balance": 200000
}
```

---

# 11. Crear factura

```http
POST /supplier-invoices
```

### Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

### Body

```json
{
  "supplierId": "uuid",
  "invoiceNumber": "A-0001-00012345",
  "issueDate": "2026-08-01",
  "dueDate": "2026-09-01",
  "totalAmount": 120000,
  "notes": "Compra de mercadería"
}
```

### Campos

| Campo         | Tipo   | Obligatorio |
| ------------- | ------ | ----------- |
| supplierId    | UUID   | Sí          |
| invoiceNumber | string | Sí          |
| issueDate     | date   | Sí          |
| dueDate       | date   | No          |
| totalAmount   | number | Sí          |
| notes         | string | No          |

La factura se crea inicialmente con estado:

```text
pending
```

---

# 12. Actualizar factura

```http
PATCH /supplier-invoices/:id
```

Actualmente permite modificar:

* `dueDate`;
* `notes`.

Respuesta:

```http
204 No Content
```

---

# 13. Anular factura

```http
DELETE /supplier-invoices/:id
```

La factura solo puede anularse cuando no posee pagos imputados.

Respuesta:

```http
204 No Content
```

---

# 14. Supplier Payments

Los pagos utilizan:

```http
/supplier-payments
```

---

## 14.1. Listar pagos

```http
GET /supplier-payments
```

### Query Params

| Parámetro | Tipo       | Obligatorio |
| --------- | ---------- | ----------- |
| from      | YYYY-MM-DD | No          |
| to        | YYYY-MM-DD | No          |

La sociedad se obtiene del usuario autenticado.

---

# 15. Resumen de pagos de proveedor

```http
GET /supplier-payments/supplier/:supplierId
```

Devuelve:

* `supplierId`;
* `totalPaid`;
* listado de pagos.

---

# 16. Aplicaciones de un pago

```http
GET /supplier-payments/:id/applications
```

Devuelve las facturas cubiertas por el pago.

---

# 17. Registrar pago

```http
POST /supplier-payments
```

### Body

```json
{
  "supplierId": "uuid",
  "amount": 50000,
  "method": "transfer",
  "supplierInvoiceId": "uuid",
  "notes": "Pago parcial"
}
```

### Campos

| Campo             | Tipo          | Obligatorio |
| ----------------- | ------------- | ----------- |
| supplierId        | UUID          | Sí          |
| amount            | number        | Sí          |
| method            | PaymentMethod | Sí          |
| supplierInvoiceId | UUID          | No          |
| notes             | string        | No          |

Si se indica `supplierInvoiceId`, el pago intenta imputarse automáticamente a esa factura.

---

# 18. Imputar pago manualmente

```http
POST /supplier-payments/:id/applications
```

### Body

```json
{
  "applications": [
    {
      "supplierInvoiceId": "uuid",
      "amount": 30000
    },
    {
      "supplierInvoiceId": "uuid",
      "amount": 20000
    }
  ]
}
```

Permite distribuir un pago entre una o más facturas.

La suma imputada no puede superar el importe disponible del pago.

Respuesta:

```http
204 No Content
```

---

# 19. Relación con Caja

Los pagos de proveedores forman parte del dominio financiero y `CASH_MOVEMENTS` contempla:

```text
related_supplier_payment_id
```

Esto permite asociar un movimiento de caja con un pago de proveedor.

La API de Caja/Cash Movements continúa siendo responsable de sus propios endpoints.

Este módulo no debe crear endpoints duplicados para Caja.

---

# 20. Resumen de Endpoints

## Suppliers

| Método | Endpoint         |
| ------ | ---------------- |
| GET    | `/suppliers`     |
| GET    | `/suppliers/:id` |
| POST   | `/suppliers`     |
| PATCH  | `/suppliers/:id` |
| DELETE | `/suppliers/:id` |

## Supplier Invoices

| Método | Endpoint                                       |
| ------ | ---------------------------------------------- |
| GET    | `/supplier-invoices`                           |
| GET    | `/supplier-invoices/supplier/:supplierId/debt` |
| GET    | `/supplier-invoices/:id`                       |
| GET    | `/supplier-invoices/:id/balance`               |
| GET    | `/supplier-invoices/:id/applications`          |
| POST   | `/supplier-invoices`                           |
| PATCH  | `/supplier-invoices/:id`                       |
| DELETE | `/supplier-invoices/:id`                       |

## Supplier Payments

| Método | Endpoint                                  |
| ------ | ----------------------------------------- |
| GET    | `/supplier-payments`                      |
| GET    | `/supplier-payments/supplier/:supplierId` |
| GET    | `/supplier-payments/:id/applications`     |
| POST   | `/supplier-payments`                      |
| POST   | `/supplier-payments/:id/applications`     |

---

# 21. Estado Actual

**Documento actualizado Sprint 05.**

El Backend cuenta actualmente con módulos implementados para:

* proveedores;
* facturas de proveedores;
* pagos a proveedores;
* imputaciones;
* deuda de proveedores.

El Frontend de proveedores actualmente se encuentra en estado placeholder y requiere implementación.

El módulo de compras/abastecimiento y la relación directa Producto → Proveedor no deben considerarse implementados actualmente.
