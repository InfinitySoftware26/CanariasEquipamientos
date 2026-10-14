# Canarias System — Cash Movements API

# Objetivo

Documentar el módulo de movimientos financieros del sistema.

El módulo es responsable de registrar:

* ingresos;
* egresos;
* transferencias;
* relación con pagos;
* relación con pagos a proveedores.

Los movimientos son utilizados para calcular los saldos financieros de las cajas.

---

# Módulo Backend

```text
backend/src/modules/cash-movements/
```

El módulo utiliza:

* `CashMovementsController`
* `CashMovementsService`
* `CashMovementsRepository`
* `CashMovement` entity

---

# Endpoint Base

```http
/api/v1/cash-movements
```

---

# Roles Permitidos

| Rol         | Lectura | Escritura |
| ----------- | ------- | --------- |
| ADMIN       | Sí      | Sí        |
| MANAGER     | Sí      | Sí        |
| SUPER_ADMIN | Sí      | Sí        |
| SELLER      | No      | No        |
| COLLECTOR   | No      | No        |

Todos los endpoints requieren:

* JWT
* RolesGuard
* SocietyGuard

---

# Tipos de Movimiento

| Tipo     | Valor      | Descripción   |
| -------- | ---------- | ------------- |
| INCOME   | `income`   | Ingreso       |
| EXPENSE  | `expense`  | Egreso        |
| TRANSFER | `transfer` | Transferencia |

---

# Listar Movimientos

## Endpoint

```http
GET /cash-movements
```

---

# Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Objetivo

Obtener movimientos financieros de la sociedad o de una caja determinada.

---

# Query Params

| Parámetro | Tipo | Obligatorio |
| --------- | ---- | ----------- |
| cashboxId | UUID | No          |
| from      | date | No          |
| to        | date | No          |

---

# Ejemplos

```http
GET /cash-movements
```

Obtiene movimientos de la sociedad.

```http
GET /cash-movements?cashboxId=uuid
```

Obtiene movimientos asociados a una caja.

```http
GET /cash-movements?from=2026-10-01&to=2026-10-04
```

Obtiene movimientos dentro del período indicado.

---

# Resultado

El listado devuelve los movimientos registrados.

Cada movimiento contiene actualmente:

* movementId;
* cashboxId;
* societyId;
* staffId;
* type;
* amount;
* concept;
* relatedPaymentId;
* relatedSupplierPaymentId;
* createdAt.

---

# Registrar Movimiento

## Endpoint

```http
POST /cash-movements
```

---

# Roles

* ADMIN
* MANAGER
* SUPER_ADMIN

---

# Objetivo

Registrar un nuevo movimiento financiero.

---

# Request

```json
{
  "cashboxId": "uuid",
  "type": "expense",
  "amount": 5000,
  "concept": "Compra de insumos de oficina"
}
```

---

# Relación con Pago de Cliente

Cuando el movimiento proviene de un pago de cliente puede incluir:

```json
{
  "relatedPaymentId": "uuid"
}
```

---

# Relación con Pago a Proveedor

Cuando el movimiento corresponde a un pago a proveedor puede incluir:

```json
{
  "relatedSupplierPaymentId": "uuid"
}
```

---

# Request Completo

```json
{
  "cashboxId": "uuid",
  "type": "income",
  "amount": 15000,
  "concept": "Cobranza",
  "relatedPaymentId": "uuid",
  "relatedSupplierPaymentId": null
}
```

---

# Validaciones

| Campo                    | Regla                            |
| ------------------------ | -------------------------------- |
| cashboxId                | UUID requerido                   |
| type                     | `income`, `expense` o `transfer` |
| amount                   | número positivo                  |
| concept                  | requerido                        |
| relatedPaymentId         | UUID opcional                    |
| relatedSupplierPaymentId | UUID opcional                    |

---

# Resultado Operativo

El movimiento queda asociado a:

* la caja indicada;
* la sociedad del usuario autenticado;
* el usuario responsable;
* el tipo de movimiento;
* el importe;
* el concepto;
* la operación relacionada cuando corresponda.

---

# INCOME

Un movimiento:

```text
income
```

representa dinero que ingresa a la caja.

El importe incrementa el saldo calculado.

---

# EXPENSE

Un movimiento:

```text
expense
```

representa dinero que sale de la caja.

El importe disminuye el saldo calculado.

---

# TRANSFER

Actualmente el backend reconoce:

```text
transfer
```

como tipo de movimiento.

La implementación actual registra el movimiento asociado a una única `cashboxId`.

Por lo tanto, **la API actual todavía no representa una transferencia completa entre dos cuentas con origen y destino**.

---

# Evolución de TRANSFER

Según las reglas de negocio definidas, una transferencia deberá representar:

```text
Cuenta origen
        ↓
     importe
        ↓
Cuenta destino
```

y deberá:

* disminuir el saldo de la cuenta origen;
* aumentar el saldo de la cuenta destino;
* no modificar el dinero total de la sociedad.

La adaptación de la API queda pendiente y deberá realizarse manteniendo compatibilidad con las rutas existentes.

---

# Relación con Cobranzas

Los movimientos pueden relacionarse actualmente con un pago de cliente mediante:

```text
relatedPaymentId
```

El flujo completo de cobranza contempla:

```text
Pago
   ↓
Cierre diario
   ↓
Liquidación
   ↓
Validación administrativa
   ↓
Movimiento financiero
```

El módulo de `settlements` ya existe.

La generación automática del movimiento financiero al validar una liquidación todavía no está implementada en el código actual.

---

# Relación con Proveedores

Los movimientos pueden relacionarse con un pago a proveedor mediante:

```text
relatedSupplierPaymentId
```

Esto permite conservar trazabilidad entre:

```text
Proveedor
   ↓
Pago proveedor
   ↓
Movimiento financiero
```

---

# Fondo de Gestión

El modelo actual no posee todavía una cuenta específica de Fondo de Gestión.

La implementación futura deberá permitir que el Fondo de Gestión utilice el mismo modelo de cuentas financieras.

El movimiento desde una cuenta operativa hacia el Fondo de Gestión será una:

```text
TRANSFER
```

Los egresos realizados desde el Fondo de Gestión serán:

```text
EXPENSE
```

La visibilidad de estos movimientos deberá estar restringida en backend para:

* MANAGER;
* SUPER_ADMIN.

ADMIN podrá registrar una transferencia hacia el Fondo de Gestión, pero no podrá consultar su saldo ni sus egresos internos.

---

# Seguridad

* JWT obligatorio.
* Roles mediante `RolesGuard`.
* Sociedad mediante `SocietyGuard`.
* El `societyId` se obtiene del usuario autenticado.
* La información financiera restringida deberá protegerse desde backend.

---

# Auditoría

Actualmente los movimientos registran:

* usuario responsable mediante `staffId`;
* sociedad;
* fecha;
* tipo;
* importe;
* concepto;
* caja;
* operación relacionada.

---

# Restricciones

* No se permiten importes negativos.
* El importe debe ser positivo.
* El concepto es obligatorio.
* La caja debe existir.
* El movimiento queda asociado a la sociedad del usuario autenticado.

---

# Consideraciones Actuales

El modelo existente está basado en `Cashbox`.

La evolución definida para el proyecto contempla utilizar cuentas financieras configurables para representar diferentes lugares donde puede encontrarse el dinero.

No se deberán crear módulos independientes para cada cuenta.

---

# Evolución Prevista

El módulo deberá poder evolucionar hacia:

* cuentas financieras configurables;
* transferencias con origen y destino;
* Fondo de Gestión;
* referencias a rendiciones;
* referencias a cierres;
* mayor clasificación de movimientos;
* reportes financieros básicos;
* automatización de operaciones actualmente gestionadas mediante Excel.

La lógica actual de movimientos deberá mantenerse como base de la evolución.

---

# Estado Actual

Módulo existente.

Implementado:

* listado de movimientos;
* filtros por caja;
* filtros por período;
* creación de movimientos;
* INCOME;
* EXPENSE;
* TRANSFER;
* relación con pagos de clientes;
* relación con pagos a proveedores.

Pendiente:

* modelo de cuentas financieras;
* origen y destino de transferencias;
* Fondo de Gestión;
* relación directa con rendiciones/liquidaciones;
* restricciones específicas de visibilidad del Fondo de Gestión.

Documento actualizado Sprint 05.
