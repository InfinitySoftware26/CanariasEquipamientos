# Canarias System — Reports API

## 1. Objetivo

Documentar los endpoints actualmente disponibles para la generación y descarga de reportes del sistema.

El módulo permite generar documentos en formato PDF y Excel utilizando información proveniente de los módulos operativos.

---

# 2. Endpoint Base

```http
/api/v1/reports
```

---

# 3. Seguridad

Todos los endpoints del módulo están protegidos mediante:

```text
JwtAuthGuard
RolesGuard
SocietyGuard
```

Además, se requiere autenticación mediante Bearer Token.

```http
Authorization: Bearer <token>
```

---

# 4. Roles

El controlador define como roles generales:

| Rol         | Acceso |
| ----------- | ------ |
| ADMIN       | Sí     |
| MANAGER     | Sí     |
| SUPER_ADMIN | Sí     |

El endpoint de Hoja de Ruta permite adicionalmente:

| Rol       | Acceso |
| --------- | ------ |
| COLLECTOR | Sí     |

El acceso efectivo continúa sujeto a las validaciones de sociedad y permisos del sistema.

---

# 5. Contexto de Sociedad

Los endpoints que requieren información de sociedad obtienen `societyId` desde el usuario autenticado.

No se utiliza:

```http
? societyId=
```

como parámetro de los endpoints actuales.

El `societyId` se obtiene desde:

```ts
user.societyId
```

---

# 6. Endpoints Disponibles

## 6.1. Hoja de Ruta — PDF

### Endpoint

```http
GET /reports/route-sheets/:id/pdf
```

### Parámetros de ruta

| Parámetro | Tipo | Obligatorio |
| --------- | ---- | ----------- |
| id        | UUID | Sí          |

### Roles

* ADMIN
* MANAGER
* COLLECTOR
* SUPER_ADMIN

### Respuesta

```http
Content-Type: application/pdf
```

El archivo se descarga con el nombre:

```text
hoja-de-ruta-{id}.pdf
```

### Información

El documento se genera a partir de la Hoja de Ruta y sus ítems.

Incluye:

* cliente;
* tipo de actividad;
* cuota;
* resultado;
* monto cobrado;
* observaciones.

### Uso

Es un reporte contextual disponible desde el detalle de una Hoja de Ruta.

---

# 7. Cobranzas — Excel

### Endpoint

```http
GET /reports/collections/excel
```

### Query Params

| Parámetro | Tipo   | Obligatorio |
| --------- | ------ | ----------- |
| from      | string | No          |
| to        | string | No          |

Ejemplo:

```http
GET /reports/collections/excel?from=2026-08-01&to=2026-08-31
```

### Respuesta

```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

Archivo:

```text
cobranzas.xlsx
```

### Información

Incluye:

* fecha de pago;
* cliente;
* venta;
* empleado;
* importe;
* método de pago.

### Sociedad

La sociedad se obtiene desde:

```ts
user.societyId
```

---

# 8. Cuotas Pendientes — Excel

### Endpoint

```http
GET /reports/installments/pending/excel
```

### Parámetros

No requiere parámetros.

### Respuesta

```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

Archivo:

```text
cuotas-pendientes.xlsx
```

### Información

Incluye:

* cliente;
* venta;
* número de cuota;
* fecha de vencimiento;
* importe;
* importe pagado;
* estado.

La sociedad se obtiene desde el usuario autenticado.

---

# 9. Visitas Fallidas — PDF

### Endpoint

```http
GET /reports/failed-visits/pdf
```

### Parámetros

No requiere parámetros.

### Respuesta

```http
Content-Type: application/pdf
```

Archivo:

```text
visitas-fallidas.pdf
```

### Información

Incluye:

* cliente;
* cobrador;
* motivo;
* número de intento;
* fecha de reprogramación;
* fecha de creación.

La sociedad se obtiene desde:

```ts
user.societyId
```

---

# 10. Cierre de Caja — PDF

### Endpoint

```http
GET /reports/cashbox/:id/pdf
```

### Parámetros de ruta

| Parámetro | Tipo | Obligatorio |
| --------- | ---- | ----------- |
| id        | UUID | Sí          |

### Respuesta

```http
Content-Type: application/pdf
```

Archivo:

```text
cierre-caja-{id}.pdf
```

### Información

El reporte obtiene la información de la caja y su saldo.

Incluye:

* saldo inicial;
* saldo del sistema;
* saldo declarado al cierre;
* estado del cierre.

### Uso

Es un reporte contextual asociado a una caja/cierre específico.

---

# 11. Movimientos de Caja — Excel

### Endpoint

```http
GET /reports/cash-movements/excel
```

### Query Params

| Parámetro | Tipo   | Obligatorio |
| --------- | ------ | ----------- |
| from      | string | No          |
| to        | string | No          |

Ejemplo:

```http
GET /reports/cash-movements/excel?from=2026-08-01&to=2026-08-31
```

### Respuesta

```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

Archivo:

```text
movimientos-caja.xlsx
```

### Información

Incluye:

* fecha;
* tipo;
* concepto;
* importe;
* caja.

### Sociedad

La sociedad se obtiene desde:

```ts
user.societyId
```

---

# 12. Pagos a Proveedores — Excel

### Endpoint

```http
GET /reports/supplier-payments/excel
```

### Query Params

| Parámetro | Tipo   | Obligatorio |
| --------- | ------ | ----------- |
| from      | string | No          |
| to        | string | No          |

### Respuesta

```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

Archivo:

```text
pagos-proveedores.xlsx
```

### Información

Incluye:

* fecha de pago;
* proveedor;
* importe;
* método;
* observaciones.

La sociedad se obtiene desde el usuario autenticado.

---

# 13. Recibo — PDF

### Endpoint

```http
GET /reports/receipts/:id/pdf
```

### Parámetros de ruta

| Parámetro | Tipo | Obligatorio |
| --------- | ---- | ----------- |
| id        | UUID | Sí          |

### Respuesta

```http
Content-Type: application/pdf
```

Archivo:

```text
recibo-{id}.pdf
```

### Uso

Es un documento contextual asociado a un recibo específico.

La generación es delegada al servicio de recibos.

---

# 14. Resumen de Endpoints

| Método | Endpoint                              | Formato | Contexto   |
| ------ | ------------------------------------- | ------- | ---------- |
| GET    | `/reports/route-sheets/:id/pdf`       | PDF     | Contextual |
| GET    | `/reports/collections/excel`          | Excel   | Central    |
| GET    | `/reports/installments/pending/excel` | Excel   | Central    |
| GET    | `/reports/failed-visits/pdf`          | PDF     | Central    |
| GET    | `/reports/cashbox/:id/pdf`            | PDF     | Contextual |
| GET    | `/reports/cash-movements/excel`       | Excel   | Central    |
| GET    | `/reports/supplier-payments/excel`    | Excel   | Central    |
| GET    | `/reports/receipts/:id/pdf`           | PDF     | Contextual |

---

# 15. Endpoints No Implementados

Los siguientes endpoints no forman parte de la API actual y no deben considerarse contratos disponibles:

```http
GET /reports/dashboard
GET /reports/sellers
GET /reports/collectors
GET /reports/street-money
GET /reports/overdue
GET /reports/cashflow
```

Si posteriormente se requieren, deberán definirse e implementarse como nuevos contratos de API.

---

# 16. Formatos

Los formatos actualmente implementados son:

* PDF.
* Excel.

No existe actualmente un endpoint general de exportación CSV.

---

# 17. Estado Actual

**Documento actualizado Sprint 05.**

El módulo Reports cuenta actualmente con endpoints implementados para:

* cobranzas;
* cuotas pendientes;
* visitas fallidas;
* hojas de ruta;
* cierres de caja;
* movimientos de caja;
* pagos a proveedores;
* recibos.

Los reportes de Historial de Cliente y Reporte de Venta forman parte de los requerimientos funcionales del módulo, pero no cuentan actualmente con endpoints específicos implementados en el controlador de Reports.
