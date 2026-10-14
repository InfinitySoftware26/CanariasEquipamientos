# Business Rules — Suppliers

**Documento actualizado — Sprint 05**

---

# 1. Objetivo

Definir las reglas de negocio correspondientes a la gestión de proveedores de Canarias System.

El módulo debe permitir administrar la información comercial de los proveedores, relacionarlos con los productos y registrar los pagos realizados.

El módulo debe mantenerse simple y orientado a las necesidades comerciales de Canarias, sin incorporar un sistema completo de cuentas por pagar o gestión de facturas de proveedores.

---

# 2. Alcance

El módulo comprende:

* Alta de proveedores.
* Consulta de proveedores.
* Modificación de proveedores.
* Activación/desactivación.
* Relación proveedor → productos.
* Registro de pagos realizados a proveedores.
* Consulta del historial de pagos.
* Integración de pagos con movimientos de caja.
* Trazabilidad por sociedad y usuario.

Queda fuera del alcance:

* Gestión de facturas de proveedores.
* Vencimientos de facturas.
* Cuentas corrientes por factura.
* Imputación de pagos a facturas.
* Aplicaciones parciales de pagos sobre facturas.
* Cálculo de deuda basada en facturas.

---

# 3. Proveedor

Un proveedor representa una entidad comercial a la cual Canarias adquiere productos o servicios.

Cada proveedor pertenece a una sociedad.

### Datos principales

* `supplierId`
* `societyId`
* `name`
* `taxId`
* `phone`
* `email`
* `address`
* `active`
* `createdAt`
* `updatedAt`

---

# 4. Sociedad

Todo proveedor pertenece a una sociedad.

Las operaciones sobre proveedores deben respetar el contexto de sociedad obtenido del usuario autenticado.

Un usuario no debe poder operar sobre proveedores pertenecientes a otra sociedad.

---

# 5. Alta de proveedor

La creación de un proveedor requiere como mínimo:

* Nombre.

Los siguientes datos son opcionales:

* CUIT / identificación fiscal.
* Teléfono.
* Email.
* Dirección.

El proveedor se crea inicialmente como activo.

---

# 6. Modificación

Los datos comerciales del proveedor pueden modificarse mediante la operación de actualización.

La modificación no debe alterar:

* pagos históricos;
* movimientos de caja;
* relaciones históricas con productos.

---

# 7. Activación y desactivación

Los proveedores no deben eliminarse físicamente cuando dejan de utilizarse.

La operación de baja corresponde a una **desactivación lógica** mediante `active = false`.

Un proveedor desactivado:

* permanece almacenado;
* conserva sus datos históricos;
* conserva sus relaciones existentes;
* no debe aparecer como opción para nuevas asociaciones de productos;
* no debe poder seleccionarse para nuevas operaciones que requieran un proveedor activo.

---

# 8. Relación Proveedor → Producto

Cada producto puede tener asociado un proveedor mediante:

```text
PRODUCT.supplierId → SUPPLIER.supplierId
```

La relación es:

```text
1 Supplier
   ↓
N Products
```

El proveedor se almacena directamente en el producto mediante `supplierId`.

No se requiere una tabla intermedia para esta relación.

---

# 9. Reglas de asociación con productos

Al asociar un proveedor a un producto:

* el `supplierId` debe corresponder a un proveedor existente;
* el proveedor debe pertenecer a la misma sociedad;
* para nuevas asociaciones, el proveedor debe estar activo.

El producto no debe duplicar información comercial del proveedor.

Debe almacenar únicamente su referencia:

```text
supplierId
```

La información del proveedor se obtiene desde la entidad `Supplier`.

---

# 10. Cambio de proveedor de un producto

El proveedor asociado a un producto puede modificarse.

Modificar `Product.supplierId` no debe modificar:

* ventas históricas;
* pagos;
* movimientos de caja;
* información histórica de operaciones anteriores.

La relación representa el proveedor actualmente asociado al producto.

Cuando el sistema incorpore un módulo formal de compras/ingresos de stock, las operaciones de compra deberán conservar su propio proveedor para mantener trazabilidad histórica.

---

# 11. Desactivación de un proveedor asociado a productos

La desactivación de un proveedor no debe eliminar ni romper las relaciones existentes con productos.

Los productos conservan su `supplierId`.

El proveedor desactivado:

* continúa siendo identificable en registros existentes;
* no debe aparecer como proveedor disponible para nuevas asociaciones;
* no debe eliminarse físicamente.

---

# 12. Pagos a proveedores

Un pago a proveedor representa una salida de dinero realizada por Canarias hacia un proveedor.

El pago debe registrar como mínimo:

* `supplierId`
* `societyId`
* `staffId`
* `amount`
* `method`
* `paymentDate`
* `notes`
* `createdAt`

---

# 13. Registro de pagos

El pago debe estar asociado a un proveedor existente.

El importe debe ser mayor que cero.

El método de pago debe corresponder a los métodos permitidos por el sistema.

El pago registra el importe efectivamente abonado al proveedor.

---

# 14. Relación entre pago y proveedor

La relación es:

```text
Supplier
   ↓
SupplierPayment
```

Un proveedor puede tener múltiples pagos.

Cada pago pertenece a un único proveedor.

---

# 15. Pagos y caja

Los pagos realizados a proveedores representan egresos financieros y deben integrarse con el módulo de movimientos de caja cuando corresponda.

La relación debe permitir identificar:

```text
Supplier Payment
       ↓
Cash Movement
```

De esta forma puede conocerse:

* qué proveedor recibió el pago;
* cuánto se pagó;
* cuándo se pagó;
* qué movimiento de caja originó o registró el egreso.

---

# 16. Historial de pagos

El sistema debe permitir consultar el historial de pagos realizados a un proveedor.

El historial debe permitir identificar:

* fecha;
* importe;
* método;
* usuario responsable;
* observaciones.

Los pagos históricos no deben modificarse como consecuencia de cambios posteriores en los datos comerciales del proveedor.

---

# 17. Resumen de pagos

El sistema puede proporcionar un resumen de los pagos realizados a un proveedor.

El resumen debe basarse exclusivamente en los pagos registrados.

No debe existir un cálculo de deuda basado en facturas, ya que la gestión de facturas de proveedores queda fuera del alcance del módulo.

---

# 18. Facturas de proveedores — fuera de alcance

El proyecto **no gestionará facturas de proveedores como una entidad propia** en esta etapa.

Por lo tanto, no forman parte del modelo funcional:

* `SupplierInvoice`;
* estados de factura;
* vencimiento de factura;
* saldo de factura;
* deuda por factura;
* aplicaciones de pago;
* imputaciones de pago a factura.

La documentación o comprobante que entregue externamente el proveedor no implica que deba existir una entidad `SupplierInvoice` dentro del sistema.

---

# 19. Eliminación del módulo Supplier Invoices

El backend actualmente contiene un módulo `supplier-invoices`.

Este módulo deberá ser eliminado o retirado del alcance:

```text
backend/src/modules/supplier-invoices/
```

También deberán eliminarse sus dependencias en `supplier-payments`, incluyendo:

* DTOs de imputación;
* aplicaciones de pago;
* consultas de facturas;
* cálculo de deuda por facturas;
* relaciones entre pagos y facturas;
* servicios utilizados exclusivamente para facturas.

La eliminación debe realizarse mediante una migración/limpieza de base de datos cuando corresponda, evitando dejar tablas o relaciones huérfanas.

---

# 20. Seguridad

Las operaciones de proveedores y pagos deben respetar:

* autenticación mediante JWT;
* autorización por roles;
* aislamiento por sociedad.

Roles administrativos contemplados:

* `ADMIN`
* `MANAGER`
* `SUPER_ADMIN`

El `societyId` debe provenir del contexto autenticado y no debe confiarse en un valor enviado libremente por el frontend.

---

# 21. Trazabilidad

Las operaciones relevantes deben conservar información suficiente para determinar:

* sociedad;
* proveedor;
* usuario responsable;
* fecha;
* importe;
* operación realizada.

Los registros históricos no deben perderse por desactivación de proveedores.

---

# 22. Principios del módulo

El módulo debe mantenerse:

* simple;
* trazable;
* orientado al negocio;
* integrado con productos;
* integrado con caja;
* preparado para una futura evolución hacia compras/stock.

No se debe incorporar complejidad contable que no sea necesaria para el alcance actual.
