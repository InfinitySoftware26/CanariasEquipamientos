# Business Rules — Proveedores

## 1. Objetivo

El módulo de Proveedores permite administrar los proveedores comerciales de la sociedad y gestionar la información relacionada con sus operaciones financieras.

El dominio de proveedores comprende:

* proveedores;
* facturas de proveedores;
* deuda con proveedores;
* pagos a proveedores;
* imputación de pagos a facturas;
* relación de los pagos con Caja;
* información necesaria para futuras operaciones de compras y stock.

El módulo debe mantener separada la información del proveedor de las operaciones financieras realizadas con él.

---

# 2. Conceptos principales

El dominio se divide en tres componentes principales:

### Proveedor

Representa la entidad comercial que suministra productos o servicios.

### Factura de proveedor

Representa una obligación registrada con un proveedor.

### Pago a proveedor

Representa un desembolso realizado a un proveedor.

La relación entre estos conceptos es:

```text
Proveedor
    │
    ├── Facturas
    │       │
    │       └── Imputaciones
    │
    └── Pagos
            │
            └── Imputaciones → Facturas
```

---

# 3. Proveedor

Cada proveedor pertenece a una sociedad.

Actualmente el proveedor contiene:

* nombre;
* identificación fiscal;
* teléfono;
* email;
* dirección;
* estado activo/inactivo;
* fecha de creación;
* fecha de actualización.

El proveedor debe quedar asociado a la sociedad mediante `societyId`.

---

# 4. Alta de Proveedor

La creación de un proveedor debe:

1. validar la información recibida;
2. obtener la sociedad desde el usuario autenticado;
3. crear el proveedor asociado a dicha sociedad;
4. establecerlo como activo inicialmente.

El Frontend no debe permitir seleccionar arbitrariamente otra sociedad mediante un `societyId` enviado desde el formulario.

La sociedad debe obtenerse del contexto autenticado.

---

# 5. Edición de Proveedor

Los datos comerciales del proveedor pueden ser modificados por los roles autorizados.

Actualmente se contemplan:

* nombre;
* identificación fiscal;
* teléfono;
* email;
* dirección.

La edición no debe alterar las operaciones financieras históricas asociadas al proveedor.

---

# 6. Desactivación de Proveedor

La eliminación de un proveedor es lógica.

La operación cambia:

```text
active = true
```

a:

```text
active = false
```

El proveedor no debe eliminarse físicamente cuando posee información histórica.

Esto permite conservar:

* facturas;
* pagos;
* deuda histórica;
* trazabilidad de operaciones.

---

# 7. Listado de Proveedores

El listado debe respetar la sociedad activa.

Debe permitir consultar:

* todos los proveedores;
* únicamente proveedores activos.

Los proveedores se ordenan por nombre.

---

# 8. Detalle del Proveedor

El detalle de proveedor debe funcionar como punto de consulta de toda la información relacionada.

Debe poder mostrar progresivamente:

* datos comerciales;
* estado;
* facturas;
* deuda;
* pagos;
* historial financiero.

El detalle debe utilizar la información registrada en los módulos correspondientes.

No debe duplicar información financiera en la entidad `Supplier`.

---

# 9. Facturas de Proveedores

Las facturas representan obligaciones económicas de la sociedad frente a un proveedor.

Cada factura contiene:

* proveedor;
* número de factura;
* fecha de emisión;
* fecha de vencimiento;
* importe total;
* estado;
* observaciones;
* sociedad;
* fecha de creación;
* fecha de actualización.

El número de factura debe ser único para un mismo proveedor.

---

# 10. Estados de Factura

Actualmente se contemplan los siguientes estados:

```text
pending
partially_paid
paid
cancelled
```

### `pending`

La factura no posee pagos imputados.

### `partially_paid`

La factura posee pagos imputados pero todavía mantiene saldo pendiente.

### `paid`

La suma de los pagos imputados alcanza el importe total de la factura.

### `cancelled`

La factura fue anulada.

---

# 11. Registro de Factura

Para registrar una factura se requiere:

* proveedor;
* número de factura;
* fecha de emisión;
* importe total.

La fecha de vencimiento y las observaciones son opcionales.

La factura se crea inicialmente como:

```text
pending
```

---

# 12. Modificación de Factura

Una factura existente puede actualizar:

* fecha de vencimiento;
* observaciones.

La modificación no debe cambiar:

* proveedor;
* importe total;
* número de factura;
* sociedad.

---

# 13. Anulación de Factura

Una factura puede ser anulada únicamente si no posee pagos imputados.

No se permite:

```text
Factura con pagos
        ↓
Anular
```

Si existen pagos imputados, la operación debe rechazarse.

Una factura anulada no puede recibir nuevos pagos.

---

# 14. Saldo de Factura

El saldo de una factura se obtiene mediante:

```text
saldo = importe_total - importe_imputado
```

Donde:

```text
importe_imputado
=
suma de aplicaciones de pagos sobre la factura
```

El cálculo debe realizarse a partir de las imputaciones registradas.

No debe almacenarse un saldo independiente que pueda quedar desactualizado.

---

# 15. Deuda del Proveedor

La deuda del proveedor representa el importe total facturado que permanece pendiente.

El cálculo se basa en:

```text
deuda =
total facturado no cancelado
-
total imputado
```

La deuda debe poder consultarse desde el contexto del proveedor.

---

# 16. Pagos a Proveedores

Un pago a proveedor representa un desembolso realizado por la sociedad.

Cada pago registra:

* proveedor;
* sociedad;
* empleado que realizó la operación;
* importe;
* método de pago;
* fecha;
* observaciones.

Los métodos de pago utilizan el enum general de métodos de pago del sistema.

---

# 17. Registro de Pago

Para registrar un pago se requiere:

* proveedor;
* importe;
* método de pago.

Opcionalmente puede indicarse una factura para realizar la imputación automática.

El empleado responsable se obtiene del usuario autenticado.

La sociedad también se obtiene del usuario autenticado.

---

# 18. Imputación de Pagos

Un pago puede imputarse:

* automáticamente a una factura;
* manualmente a una o varias facturas.

La suma de las imputaciones de un pago nunca puede superar el importe total disponible del pago.

Ejemplo:

```text
Pago: $100.000

Factura A: $60.000
Factura B: $40.000

Total imputado: $100.000
```

La operación es válida.

---

# 19. Imputación Parcial

Una factura puede recibir pagos parciales.

Ejemplo:

```text
Factura: $100.000

Pago 1: $40.000
Pago 2: $30.000

Saldo: $30.000
Estado: partially_paid
```

Cuando el total imputado alcanza el importe de la factura:

```text
Estado: paid
```

---

# 20. Restricciones de Imputación

No se puede imputar un pago a:

* una factura inexistente;
* una factura anulada;
* una factura cuyo saldo sea inferior al importe que se intenta imputar.

Tampoco se puede superar el importe disponible de un pago.

---

# 21. Relación con Caja

Los pagos a proveedores representan una salida financiera de la sociedad.

El dominio de Caja debe registrar el movimiento financiero correspondiente al pago cuando la operación requiera afectar la caja.

El movimiento de caja debe poder identificar el pago de proveedor mediante:

```text
relatedSupplierPaymentId
```

Actualmente `CASH_MOVEMENTS` contempla específicamente este campo.

Esto permite mantener la trazabilidad:

```text
SupplierPayment
      ↓
CashMovement
      ↓
Cashbox
```

---

# 22. Métodos de Pago y Caja

El método utilizado en el pago determina cómo debe interpretarse financieramente la operación.

El módulo de Proveedores no debe modificar directamente los saldos mediante cálculos propios.

Los saldos de Caja deben continuar siendo responsabilidad del módulo de Caja/Cash Movements.

---

# 23. Trazabilidad Financiera

Cada pago debe poder identificarse mediante:

* proveedor;
* sociedad;
* empleado;
* importe;
* método;
* fecha;
* factura/s imputada/s.

Cuando corresponda, debe existir la relación con el movimiento financiero de Caja.

Esto permite reconstruir:

```text
Proveedor
    ↓
Pago
    ↓
Movimiento de Caja
    ↓
Caja
```

---

# 24. Relación con Productos

Los proveedores forman parte del dominio de productos y stock a nivel funcional.

Un proveedor representa una posible fuente de abastecimiento de productos.

Sin embargo, en la implementación actual del ZIP:

```text
PRODUCTS
```

no contiene actualmente:

```text
supplierId
```

Por lo tanto, la relación directa:

```text
PRODUCT → SUPPLIER
```

no debe considerarse implementada actualmente.

Si se incorpora posteriormente, deberá definirse explícitamente:

* asociación producto-proveedor;
* proveedor principal;
* costo de adquisición;
* historial de costos;
* operaciones de compra;
* impacto en stock.

---

# 25. Relación con Stock y Compras

El flujo funcional previsto contempla que los proveedores formen parte del proceso de abastecimiento.

Conceptualmente:

```text
Proveedor
    ↓
Compra
    ↓
Producto
    ↓
Stock
    ↓
Pago
    ↓
Caja
```

Actualmente el ZIP contiene documentación de workflow de Stock que contempla proveedores y pagos, pero el módulo de proveedores implementado no constituye todavía un módulo completo de compras/recepción de stock.

Por lo tanto, estas operaciones deben considerarse parte de una evolución posterior y no deben inventarse dentro del CRUD actual de proveedores.

---

# 26. Historial Financiero

El proveedor debe poder consultarse junto con sus operaciones financieras.

El historial debe permitir reconstruir:

* facturas;
* pagos;
* imputaciones;
* deuda;
* estado de las facturas.

La información debe provenir de:

```text
SUPPLIER_INVOICES
SUPPLIER_PAYMENTS
SUPPLIER_INVOICE_PAYMENT_APPLICATIONS
```

---

# 27. Sociedad

Todas las operaciones de proveedores deben respetar la sociedad activa.

Los datos pertenecientes a una sociedad no deben mezclarse con los de otra.

El `societyId` debe provenir del usuario autenticado cuando la operación lo requiera.

---

# 28. Permisos

Las operaciones de administración de proveedores, facturas y pagos están actualmente habilitadas para:

* ADMIN;
* MANAGER;
* SUPER_ADMIN.

La lectura básica de proveedores actualmente no restringe explícitamente los roles en el controlador y continúa protegida por autenticación y sociedad.

---

# 29. Auditoría

Las operaciones financieras relacionadas con proveedores deben conservar trazabilidad.

No se deben eliminar físicamente:

* proveedores con historial;
* facturas;
* pagos;
* imputaciones.

Las facturas se anulan mediante cambio de estado.

Los proveedores se desactivan mediante cambio de estado.

---

# 30. Principios

* Cada proveedor pertenece a una sociedad.
* Los proveedores se desactivan, no se eliminan físicamente.
* Las facturas representan obligaciones económicas.
* Los pagos representan desembolsos realizados.
* Las facturas pueden pagarse parcial o totalmente.
* Un pago no puede imputarse por encima de su importe.
* Una factura anulada no puede recibir pagos.
* Una factura con pagos imputados no puede anularse.
* La deuda debe calcularse desde facturas e imputaciones.
* Los pagos deben mantener trazabilidad financiera.
* Los pagos relacionados con caja deben poder identificarse mediante `relatedSupplierPaymentId`.
* Los datos de productos/stock no deben duplicarse dentro del proveedor.
* La relación directa Producto → Proveedor no se considera implementada hasta que exista en código.
* Toda operación debe respetar la sociedad activa y los permisos correspondientes.
