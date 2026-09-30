# Integration Back ↔ Front — Proveedores

# 1. Objetivo

Documentar la integración entre Backend y Frontend del dominio de Proveedores.

El dominio comprende:

```text
Proveedores
Facturas
Pagos
Imputaciones
Deuda
Caja
```

---

# 2. Estado Actual

Actualmente el Backend cuenta con los módulos:

```text
backend/src/modules/suppliers/
backend/src/modules/supplier-invoices/
backend/src/modules/supplier-payments/
```

El Frontend todavía no posee una implementación funcional del módulo.

Actualmente existe:

```text
canarias-frontend/src/app/(private)/suppliers/page.tsx
```

pero la página utiliza:

```tsx
<PagePlaceholder
  title="Proveedores"
  description="Gestión y administración de proveedores."
/>
```

Por lo tanto, la integración Frontend está pendiente de desarrollo.

---

# 3. Arquitectura de Integración

La integración esperada es:

```text
Frontend
   │
   ├── Suppliers
   │
   ├── Supplier Invoices
   │
   └── Supplier Payments
          │
          ↓
       Backend
          │
          ├── SuppliersService
          ├── SupplierInvoicesService
          └── SupplierPaymentsService
                    │
                    ↓
                  Caja
```

---

# 4. Estructura Frontend a desarrollar

Se recomienda mantener la estructura modular existente del proyecto:

```text
canarias-frontend/src/

app/(private)/suppliers/
components/suppliers/
services/suppliers/
hooks/suppliers/
types/suppliers/
```

Para las facturas y pagos puede utilizarse una estructura específica dentro del dominio:

```text
components/suppliers/
  SupplierForm.tsx
  SupplierTable.tsx
  SupplierDetail.tsx
  SupplierInvoices.tsx
  SupplierPayments.tsx
  SupplierDebt.tsx
```

La implementación debe reutilizar los componentes generales existentes del proyecto.

---

# 5. Pantalla Principal de Proveedores

Ruta:

```text
/suppliers
```

Debe permitir:

* listar proveedores;
* buscar/filtrar proveedores;
* crear proveedor;
* editar proveedor;
* desactivar proveedor;
* ingresar al detalle.

El listado debe utilizar:

```http
GET /suppliers
```

---

# 6. Alta de Proveedor

El formulario debe utilizar:

```http
POST /suppliers
```

Campos:

```text
Nombre
Identificación fiscal
Teléfono
Email
Dirección
```

No debe incluir:

```text
societyId
```

porque la sociedad proviene del contexto autenticado.

---

# 7. Edición

El formulario de edición utiliza:

```http
PATCH /suppliers/:id
```

La respuesta esperada es:

```http
204 No Content
```

Luego de modificar el proveedor, el listado/detalle debe actualizarse.

---

# 8. Desactivación

La acción utiliza:

```http
DELETE /suppliers/:id
```

No debe eliminar físicamente el registro.

La interfaz debe mostrar confirmación antes de realizar la operación.

---

# 9. Detalle de Proveedor

El detalle del proveedor debe centralizar la información:

```text
┌─────────────────────────────┐
│ Datos del proveedor         │
├─────────────────────────────┤
│ Deuda actual                │
├─────────────────────────────┤
│ Facturas                    │
├─────────────────────────────┤
│ Pagos                       │
└─────────────────────────────┘
```

---

# 10. Deuda

La deuda se obtiene mediante:

```http
GET /supplier-invoices/supplier/:supplierId/debt
```

No debe calcularse nuevamente en Frontend.

El Backend devuelve:

```text
totalInvoiced
totalPaid
balance
```

Frontend solamente representa esos valores.

---

# 11. Facturas

El listado de facturas puede utilizar:

```http
GET /supplier-invoices?supplierId=:supplierId
```

Debe permitir visualizar:

* número;
* fecha;
* vencimiento;
* importe;
* estado;
* saldo.

Para obtener el saldo de una factura:

```http
GET /supplier-invoices/:id/balance
```

---

# 12. Crear Factura

El formulario utiliza:

```http
POST /supplier-invoices
```

La factura requiere:

```text
Proveedor
Número
Fecha emisión
Fecha vencimiento
Importe
Observaciones
```

El proveedor debe estar seleccionado desde el contexto del proveedor o mediante selector correspondiente.

---

# 13. Anular Factura

La acción utiliza:

```http
DELETE /supplier-invoices/:id
```

Antes de mostrar la acción debe tenerse en cuenta que una factura con pagos imputados no puede anularse.

La validación definitiva corresponde al Backend.

Frontend debe mostrar el error devuelto por Backend si la operación no es válida.

---

# 14. Pagos

El detalle del proveedor debe mostrar sus pagos mediante:

```http
GET /supplier-payments/supplier/:supplierId
```

Debe mostrar como mínimo:

* fecha;
* importe;
* método;
* observaciones.

---

# 15. Registrar Pago

El formulario utiliza:

```http
POST /supplier-payments
```

Debe permitir:

```text
Proveedor
Importe
Método
Factura opcional
Observaciones
```

Si el usuario selecciona una factura, el Backend puede realizar la imputación automática.

---

# 16. Imputación Manual

Cuando un pago deba distribuirse entre varias facturas, utilizar:

```http
POST /supplier-payments/:id/applications
```

Ejemplo:

```text
Pago $100.000

Factura A → $60.000
Factura B → $40.000
```

El Backend valida que la suma no supere el importe disponible.

Frontend no debe implementar esta validación como única protección.

---

# 17. Historial de Pagos

El historial debe mostrar los pagos asociados al proveedor.

También puede consultar las facturas cubiertas por un pago:

```http
GET /supplier-payments/:id/applications
```

Esto permite visualizar:

```text
Pago
 ├── Factura A → $30.000
 └── Factura B → $20.000
```

---

# 18. Relación con Caja

Cuando se registra un pago a proveedor, la operación pertenece al circuito financiero de la sociedad.

El modelo de Caja contempla:

```text
related_supplier_payment_id
```

por lo que el movimiento financiero puede relacionarse con el pago de proveedor.

Frontend de Proveedores no debe modificar directamente el saldo de Caja.

La información financiera debe permanecer sincronizada mediante las operaciones Backend correspondientes.

---

## 19. Relación con Productos

Cada producto debe estar asociado a un proveedor mediante:

```text
supplierId
```

La relación representa el proveedor al que corresponde la adquisición del producto.

La relación es:

```text
SUPPLIER
    │
    └── PRODUCTS
            │
            └── supplierId
```

Un proveedor puede estar asociado a múltiples productos.

Cada producto tendrá un único proveedor asociado como proveedor de origen/principal.

---

## 19.1. Regla de Asociación

Al crear o modificar un producto, el `supplierId` debe corresponder a un proveedor existente y válido dentro de la sociedad activa.

No se permite asociar un producto con un proveedor perteneciente a otra sociedad.

La validación debe realizarse en Backend.

Frontend debe utilizar proveedores disponibles de la sociedad activa para seleccionar el proveedor.

---

## 19.2. Proveedor del Producto

El producto debe permitir identificar:

* proveedor;
* `supplierId`;
* información básica del proveedor cuando corresponda.

El `supplierId` se almacena como referencia al registro de `SUPPLIERS`.

No se debe duplicar dentro de `PRODUCTS` la información comercial del proveedor, como:

* nombre;
* teléfono;
* email;
* dirección.

La información del proveedor debe obtenerse mediante la relación correspondiente.

---

## 19.3. Integridad Referencial

`PRODUCTS.supplierId` debe referenciar:

```text
SUPPLIERS.id
```

No debe existir un producto asociado a un proveedor inexistente.

Cuando un proveedor se encuentre desactivado, los productos históricos asociados a dicho proveedor deben conservar su relación.

La desactivación de un proveedor no debe modificar automáticamente el `supplierId` de los productos existentes.

---

## 19.4. Proveedor y Productos Históricos

La relación producto-proveedor debe conservarse para mantener trazabilidad sobre el origen de adquisición.

Por lo tanto:

```text
Proveedor activo
       ↓
Producto
       ↓
Proveedor desactivado
```

no debe provocar la pérdida de la relación histórica.

El producto continúa mostrando el proveedor al que fue asociado originalmente.

---

## 19.5. Proveedor y Nuevos Productos

Un proveedor desactivado no debe estar disponible para asociar nuevos productos.

Los productos existentes que ya poseen ese proveedor continúan manteniendo su `supplierId`.

---

## 19.6. Cambio de Proveedor

El `supplierId` de un producto puede modificarse cuando corresponda.

La modificación representa un cambio del proveedor asociado al producto para futuras operaciones.

El cambio no debe alterar:

* ventas históricas;
* pagos históricos;
* movimientos de caja;
* operaciones anteriores de stock;
* información histórica registrada.

Las operaciones históricas deben conservar sus propios datos de origen.

---

## 19.7. Productos y Compras

La relación `Product → Supplier` permite identificar el proveedor asociado a un producto.

El flujo funcional previsto es:

```text
SUPPLIER
    ↓
PRODUCT
    ↓
COMPRA / INGRESO
    ↓
STOCK
```

La relación producto-proveedor no reemplaza el registro de una compra.

Una futura operación de compra deberá registrar sus propios datos transaccionales, como:

* proveedor;
* producto;
* cantidad;
* costo;
* fecha;
* número de comprobante;
* operación de stock.

Por lo tanto, `supplierId` identifica el proveedor asociado al producto, mientras que las operaciones de compra deberán conservar su propia trazabilidad histórica.

---

# 20. Reportes

El dominio ya posee un reporte central de pagos a proveedores:

```http
GET /reports/supplier-payments/excel
```

con:

```text
from
to
```

El reporte utiliza los pagos registrados en `SupplierPaymentsService`.

Por lo tanto:

```text
Supplier Payments
        ↓
Reports
        ↓
Excel
```

El Frontend de Reportes puede ofrecerlo como reporte central.

---

# 21. Permisos Frontend

Las acciones de administración deben mostrarse de acuerdo con los roles:

```text
ADMIN
MANAGER
SUPER_ADMIN
```

Frontend debe ocultar acciones no permitidas cuando corresponda, pero el Backend continúa siendo responsable de validar los permisos.

---

# 22. Manejo de Errores

Frontend debe contemplar como mínimo:

* proveedor inexistente;
* factura inexistente;
* factura anulada;
* factura con pagos al intentar anular;
* importe de imputación superior al saldo;
* importe imputado superior al pago disponible;
* usuario sin permisos;
* sociedad no válida.

Los mensajes definitivos provienen del Backend.

---

# 23. Flujo General

```text
                    PROVEEDOR
                        │
             ┌──────────┴──────────┐
             ↓                     ↓
         FACTURAS                PAGOS
             │                     │
             │              ┌──────┴──────┐
             │              ↓             ↓
             │         IMPUTACIÓN      CAJA
             │              │             │
             └──────────────┴─────────────┘
                            ↓
                         DEUDA
```

---

# 24. Estado de Integración

| Funcionalidad                 | Backend                              | Frontend               |
| ----------------------------- | ------------------------------------ | ---------------------- |
| Listado proveedores           | Implementado                         | Pendiente              |
| Alta proveedor                | Implementado                         | Pendiente              |
| Edición proveedor             | Implementado                         | Pendiente              |
| Desactivación                 | Implementado                         | Pendiente              |
| Detalle proveedor             | Implementado                         | Pendiente              |
| Facturas                      | Implementado                         | Pendiente              |
| Deuda                         | Implementado                         | Pendiente              |
| Pagos                         | Implementado                         | Pendiente              |
| Imputaciones                  | Implementado                         | Pendiente              |
| Integración Caja              | Backend preparado                    | Pendiente              |
| Reporte pagos proveedores     | Implementado                         | Pendiente              |
| Relación Producto → Proveedor | No implementada                      | No implementar todavía |
| Compras / abastecimiento      | No implementado como módulo completo | Pendiente              |

---

# 25. Estado Actual

**Documento actualizado Sprint 05.**

El Backend del dominio de Proveedores, Facturas y Pagos se encuentra implementado.

El Frontend de Proveedores se encuentra actualmente en estado placeholder y debe desarrollarse.

La implementación Frontend debe respetar los contratos definidos en:

* `/suppliers`;
* `/supplier-invoices`;
* `/supplier-payments`.

La integración con Caja debe respetar las relaciones financieras existentes.

La integración directa con Productos/Stock requiere un contrato específico antes de ser desarrollada.
