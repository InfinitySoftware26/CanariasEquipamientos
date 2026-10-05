# Integración Back ↔ Front — Cash Movements

# Objetivo

Documentar el contrato de integración entre Backend y Frontend para el registro y consulta de movimientos financieros.

El módulo permite registrar y consultar:

* ingresos;
* egresos;
* transferencias.

Los movimientos están asociados actualmente a una caja.

---

# Módulo

CashMovementsModule

---

# Base URL

Todos los endpoints utilizan el prefijo global:

```text
/api/v1
```

Ejemplo:

```text
http://localhost:3001/api/v1
```

---

# Endpoints Disponibles

## Obtener Movimientos

### GET /cash-movements

Permisos:

* ADMIN
* MANAGER
* SUPER_ADMIN

Descripción:

Obtiene los movimientos financieros disponibles dentro de la sociedad activa.

---

### Filtrar por Caja

```http
GET /cash-movements?cashboxId=uuid
```

Descripción:

Obtiene los movimientos asociados a una caja específica.

---

### Filtrar por Fecha

```http
GET /cash-movements?from=2026-10-01&to=2026-10-04
```

Descripción:

Obtiene los movimientos de la sociedad dentro del período indicado.

---

### Filtros Combinados

Actualmente Backend permite utilizar `cashboxId` junto con el contexto de sociedad.

Cuando se envía `cashboxId`, la consulta se realiza directamente sobre los movimientos de dicha caja.

---

# Registrar Movimiento

### POST /cash-movements

Permisos:

* ADMIN
* MANAGER
* SUPER_ADMIN

Body:

```json
{
  "cashboxId": "uuid",
  "type": "expense",
  "amount": 5000,
  "concept": "Compra de insumos de oficina"
}
```

---

# Campos

| Campo                    | Tipo   | Obligatorio |
| ------------------------ | ------ | ----------- |
| cashboxId                | UUID   | Sí          |
| type                     | enum   | Sí          |
| amount                   | number | Sí          |
| concept                  | string | Sí          |
| relatedPaymentId         | UUID   | No          |
| relatedSupplierPaymentId | UUID   | No          |

---

# Tipos de Movimiento

```text
income
expense
transfer
```

---

# INCOME

Representa un ingreso de dinero a la caja.

Ejemplo:

```json
{
  "cashboxId": "uuid",
  "type": "income",
  "amount": 15000,
  "concept": "Cobranza"
}
```

---

# EXPENSE

Representa un egreso de dinero.

Ejemplo:

```json
{
  "cashboxId": "uuid",
  "type": "expense",
  "amount": 5000,
  "concept": "Compra de insumos"
}
```

---

# TRANSFER

Backend actualmente soporta el tipo:

```text
transfer
```

Sin embargo, la implementación actual solamente recibe:

```json
{
  "cashboxId": "uuid",
  "type": "transfer",
  "amount": 10000,
  "concept": "Transferencia"
}
```

No existe todavía en el DTO actual un campo para indicar una cuenta origen y una cuenta destino.

Por lo tanto, el Frontend no deberá implementar todavía una transferencia entre dos cuentas como si ese contrato existiera.

La evolución del modelo queda documentada en Business Rules y API.

---

# Relación con Pagos

Un movimiento puede relacionarse con un pago de cliente mediante:

```json
{
  "relatedPaymentId": "uuid"
}
```

Esto permite mantener la trazabilidad entre el movimiento financiero y la cobranza.

---

# Relación con Pagos a Proveedores

Un movimiento puede relacionarse con un pago a proveedor mediante:

```json
{
  "relatedSupplierPaymentId": "uuid"
}
```

Esto permite mantener la relación:

```text
Proveedor
   ↓
Pago
   ↓
Movimiento financiero
```

---

# Flujo de Consulta

El Frontend deberá utilizar:

```text
GET /cash-movements
```

para obtener los movimientos de la sociedad.

Para una caja específica:

```text
GET /cash-movements?cashboxId=:id
```

Para una consulta temporal:

```text
GET /cash-movements?from=:date&to=:date
```

---

# Flujo de Registro

```text
Frontend
   ↓
Formulario de movimiento
   ↓
POST /cash-movements
   ↓
Backend valida
   ↓
Movimiento registrado
   ↓
Backend actualiza el cálculo del saldo
```

El Frontend no deberá actualizar manualmente el saldo financiero como fuente de verdad.

---

# Integración con Cashbox

Los movimientos actualmente se encuentran asociados a:

```text
cashboxId
```

El saldo de la caja se calcula utilizando estos movimientos.

Flujo:

```text
Cashbox
   ↓
Cash Movements
   ↓
Saldo calculado
```

---

# Integración con Rendiciones

El flujo funcional definido para las cobranzas contempla:

```text
Payment
   ↓
Daily Closure
   ↓
Settlement
   ↓
Validación ADMIN
   ↓
Cash Movement
   ↓
Cashbox
```

Actualmente el backend todavía no realiza automáticamente la última transición al validar el Settlement.

La integración deberá implementarse posteriormente sin duplicar el dinero ya registrado en Payments.

---

# Fondo de Gestión

El modelo actual todavía no contempla una cuenta financiera independiente para el Fondo de Gestión.

La integración futura utilizará el mismo modelo de cuentas financieras.

Flujo esperado:

```text
Cuenta Operativa
       ↓
   TRANSFER
       ↓
Fondo de Gestión
```

Los movimientos internos del Fondo de Gestión deberán quedar restringidos a:

* MANAGER;
* SUPER_ADMIN.

ADMIN podrá realizar la transferencia hacia el fondo, pero no deberá poder consultar su saldo ni sus egresos internos.

Esta restricción deberá aplicarse en Backend.

---

# Reportes

Actualmente el Frontend ya posee integración con el reporte de movimientos de caja mediante:

```text
GET /reports/cash-movements/excel
```

El reporte acepta:

```text
from
to
```

Esta integración pertenece al módulo de Reports y no reemplaza la consulta directa de:

```text
GET /cash-movements
```

---

# Manejo de Errores

El Frontend deberá contemplar como mínimo:

| Código | Situación              |
| ------ | ---------------------- |
| 400    | Datos inválidos        |
| 401    | Usuario no autenticado |
| 403    | Usuario sin permisos   |
| 404    | Recurso inexistente    |

---

# Estado Frontend

Actualmente no existe un servicio específico:

```text
cash-movements.service.ts
```

ni una integración específica de Cash Movements para:

* listado;
* creación;
* filtros;
* detalle.

La única integración frontend actualmente relacionada con movimientos es la descarga del reporte:

```text
canarias-frontend/src/services/reports/reports.service.ts
```

mediante:

```text
GET /reports/cash-movements/excel
```

---

# Estado Backend

Backend ya dispone de:

* listado de movimientos;
* filtro por caja;
* filtro por fecha;
* creación de movimientos;
* INCOME;
* EXPENSE;
* TRANSFER;
* relación con pagos;
* relación con pagos a proveedores.

---

# Evolución Prevista

La integración deberá evolucionar hacia el modelo de cuentas financieras definido en Business Rules.

Se deberá mantener el endpoint actual como base de compatibilidad.

La evolución contempla:

* cuentas financieras configurables;
* transferencias con origen y destino;
* Fondo de Gestión;
* referencias a rendiciones;
* referencias a cierres;
* control de permisos sobre información financiera restringida;
* mayor automatización de los procesos actualmente gestionados mediante Excel.

---

# Estado

Documento actualizado Sprint 05.
