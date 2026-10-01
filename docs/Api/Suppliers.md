# API — Suppliers

**Documento actualizado — Sprint 05**

---

# 1. Objetivo

Definir los contratos API correspondientes a proveedores y pagos a proveedores.

La API se limita a:

* gestión de proveedores;
* relación proveedor/producto mediante `supplierId`;
* registro y consulta de pagos a proveedores.

La gestión de facturas de proveedores queda fuera del alcance.

---

# 2. Seguridad

Los endpoints requieren:

```text
JwtAuthGuard
RolesGuard
SocietyGuard
```

La sociedad se obtiene desde el usuario autenticado.

No se debe enviar `societyId` desde el frontend como fuente de autoridad.

---

# 3. Suppliers

Base:

```text
/api/v1/suppliers
```

---

## 3.1 Listar proveedores

```http
GET /api/v1/suppliers
```

Query opcional:

```text
activeOnly=true
```

Ejemplo:

```http
GET /api/v1/suppliers?activeOnly=true
```

Retorna los proveedores correspondientes a la sociedad del usuario autenticado.

---

## 3.2 Obtener proveedor

```http
GET /api/v1/suppliers/:id
```

`id` debe ser UUID.

Retorna el proveedor solicitado.

---

## 3.3 Crear proveedor

```http
POST /api/v1/suppliers
```

Roles:

```text
ADMIN
MANAGER
SUPER_ADMIN
```

Body:

```json
{
  "name": "Distribuidora del Sur S.A.",
  "taxId": "30-12345678-9",
  "phone": "3871234567",
  "email": "contacto@proveedor.com",
  "address": "Av. Ejemplo 123"
}
```

`name` es obligatorio.

Los demás campos son opcionales.

La sociedad se determina mediante el usuario autenticado.

---

## 3.4 Actualizar proveedor

```http
PATCH /api/v1/suppliers/:id
```

Roles:

```text
ADMIN
MANAGER
SUPER_ADMIN
```

Permite modificar los datos comerciales del proveedor.

---

## 3.5 Desactivar proveedor

```http
DELETE /api/v1/suppliers/:id
```

Roles:

```text
ADMIN
MANAGER
SUPER_ADMIN
```

La operación corresponde a una desactivación lógica.

No se elimina físicamente el proveedor.

---

# 4. Relación con Products

El producto debe almacenar:

```text
supplierId: UUID
```

Relación:

```text
PRODUCTS.supplierId
        ↓
SUPPLIERS.supplierId
```

Al crear o modificar un producto, el backend debe validar que:

1. el proveedor exista;
2. pertenezca a la sociedad correspondiente;
3. esté activo cuando se trate de una nueva asociación.

La API de Products es responsable de recibir y validar `supplierId`.

---

# 5. Supplier Payments

Base:

```text
/api/v1/supplier-payments
```

---

## 5.1 Listar pagos

```http
GET /api/v1/supplier-payments
```

Query opcional:

```text
from=YYYY-MM-DD
to=YYYY-MM-DD
```

Ejemplo:

```http
GET /api/v1/supplier-payments?from=2026-09-01&to=2026-09-30
```

Roles:

```text
ADMIN
MANAGER
SUPER_ADMIN
```

---

## 5.2 Resumen de pagos de un proveedor

```http
GET /api/v1/supplier-payments/supplier/:supplierId
```

Retorna el resumen de pagos realizados al proveedor y el total abonado.

---

## 5.3 Registrar pago

```http
POST /api/v1/supplier-payments
```

Roles:

```text
ADMIN
MANAGER
SUPER_ADMIN
```

Body objetivo:

```json
{
  "supplierId": "uuid",
  "amount": 50000,
  "method": "cash",
  "notes": "Pago correspondiente a compra"
}
```

El backend debe:

* validar el proveedor;
* registrar la sociedad desde el usuario autenticado;
* registrar el usuario responsable;
* validar que el importe sea positivo;
* registrar fecha y método;
* guardar las observaciones.

---

# 6. Eliminación de Supplier Invoices API

Actualmente existe:

```text
/api/v1/supplier-invoices
```

Este recurso debe eliminarse del diseño final.

Deben retirarse:

```text
GET /supplier-invoices
GET /supplier-invoices/supplier/:supplierId/debt
GET /supplier-invoices/:id
GET /supplier-invoices/:id/balance
GET /supplier-invoices/:id/applications
POST /supplier-invoices
PATCH /supplier-invoices/:id
DELETE /supplier-invoices/:id
```

También deben eliminarse de `supplier-payments` los endpoints relacionados con imputaciones:

```text
GET /supplier-payments/:id/applications
POST /supplier-payments/:id/applications
```

El endpoint de creación de pagos tampoco debe recibir:

```text
supplierInvoiceId
```

---

# 7. Contrato final de Supplier Payment

El contrato final debe representar únicamente un pago realizado a un proveedor.

```text
SupplierPayment
├── supplierId
├── societyId
├── staffId
├── amount
├── method
├── paymentDate
├── notes
└── createdAt
```

No debe contener referencias a facturas.

---

# 8. Errores esperados

La API debe contemplar, entre otros:

* UUID inválido;
* proveedor inexistente;
* proveedor perteneciente a otra sociedad;
* importe inválido;
* proveedor inactivo cuando no corresponda operar;
* usuario sin permisos;
* acceso a otra sociedad.

---

# 9. Reportes

Los pagos a proveedores continúan siendo fuente de información para reportes.

Endpoint existente:

```http
GET /api/v1/reports/supplier-payments/excel
```

Query opcional:

```text
from
to
```

El reporte debe trabajar sobre `SupplierPayment` y no depender de facturas de proveedores.
