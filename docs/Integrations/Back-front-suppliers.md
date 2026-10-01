# Integration — Suppliers

**Documento actualizado — Sprint 05**

---

# 1. Objetivo

Definir la integración entre Backend y Frontend para la gestión de proveedores.

El módulo frontend debe presentar una única experiencia de **Proveedores**, integrando:

* proveedores;
* productos asociados;
* pagos realizados.

La gestión de facturas de proveedores queda fuera del alcance.

---

# 2. Estado actual

El backend cuenta actualmente con:

* módulo `suppliers`;
* módulo `supplier-payments`;
* módulo `supplier-invoices`.

El frontend mantiene la ruta:

```text
canarias-frontend/src/app/(private)/suppliers/page.tsx
```

actualmente pendiente de implementación completa.

El módulo `supplier-invoices` deberá retirarse del backend y no debe generar una pantalla frontend.

---

# 3. Estructura funcional frontend

La sección principal debe ser:

```text
/suppliers
```

La experiencia debe organizarse alrededor del proveedor.

### Listado

Debe permitir:

* visualizar proveedores;
* identificar proveedores activos/inactivos;
* crear proveedor;
* editar proveedor;
* consultar detalle.

---

# 4. Detalle de proveedor

El detalle puede organizarse en:

```text
Proveedor
│
├── Información general
│
├── Productos asociados
│
└── Historial de pagos
```

No se debe crear una sección independiente de facturas.

---

# 5. Alta y edición

El formulario de proveedor debe trabajar con los campos definidos por la API:

* nombre;
* identificación fiscal;
* teléfono;
* email;
* dirección.

El frontend no debe enviar `societyId` como dato de autoridad.

La sociedad activa/contexto de autenticación determina la sociedad sobre la que opera el backend.

---

# 6. Productos y proveedor

En el formulario de producto debe existir un selector de proveedor.

El flujo esperado:

```text
Producto
   ↓
Seleccionar proveedor
   ↓
supplierId
   ↓
POST/PATCH Product
```

Para cargar las opciones disponibles:

```http
GET /api/v1/suppliers?activeOnly=true
```

El frontend debe mostrar información amigable del proveedor, pero enviar al backend únicamente su UUID:

```json
{
  "supplierId": "uuid-del-proveedor"
}
```

---

# 7. Cambio de proveedor

Si se modifica el proveedor asociado a un producto:

```text
Producto
supplierId: proveedor anterior
        ↓
        cambio
        ↓
supplierId: proveedor nuevo
```

El frontend no debe intentar modificar información histórica de ventas, pagos o caja.

La modificación afecta únicamente la asociación actual del producto.

---

# 8. Proveedores inactivos

Los proveedores inactivos pueden continuar apareciendo en información histórica.

Sin embargo, para nuevas asociaciones de productos el selector debe utilizar:

```http
GET /api/v1/suppliers?activeOnly=true
```

De esta forma se evita seleccionar proveedores desactivados.

---

# 9. Registro de pago

Desde el detalle del proveedor debe poder iniciarse el registro de un pago.

Flujo:

```text
Proveedor
   ↓
Registrar pago
   ↓
Importe
   ↓
Método de pago
   ↓
Observaciones
   ↓
Confirmar
   ↓
POST /supplier-payments
```

El frontend no debe solicitar ni enviar:

```text
supplierInvoiceId
```

---

# 10. Historial de pagos

El detalle del proveedor debe permitir consultar sus pagos mediante:

```http
GET /api/v1/supplier-payments/supplier/:supplierId
```

Se puede mostrar:

* fecha;
* importe;
* método;
* observaciones.

El historial debe diferenciar claramente entre:

```text
Proveedor
   ↓
Pagos realizados
```

sin presentar una cuenta corriente basada en facturas.

---

# 11. Pagos y caja

Cuando un pago a proveedor genere un movimiento de caja, el frontend debe poder mantener la trazabilidad entre:

```text
Proveedor
   ↓
Pago
   ↓
Movimiento de caja
```

Los movimientos de caja pertenecen al módulo financiero y no deben duplicarse dentro de la pantalla de proveedores.

---

# 12. Eliminación de Supplier Invoices

Como parte de esta modificación, el equipo Backend deberá retirar:

```text
backend/src/modules/supplier-invoices/
```

y todas las dependencias asociadas.

También deberán revisarse:

* módulos importadores;
* entidades;
* DTOs;
* repositories;
* services;
* migrations;
* enums;
* relaciones;
* imports de `SupplierInvoicesService`;
* lógica de aplicaciones de pagos.

En particular, `supplier-payments` actualmente depende de `SupplierInvoicesService`; esa dependencia debe desaparecer.

---

# 13. Integración final Backend ↔ Frontend

El flujo final esperado es:

```text
                    SUPPLIERS
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    Información     Products       Payments
                       │              │
                  supplierId          │
                                      ▼
                                Cash Movement
```

No debe existir dependencia funcional entre:

```text
Supplier Payment
        ↓
Supplier Invoice
```

---

# 14. Estados de UI

El frontend debe contemplar:

### Loading

Mientras se cargan:

* proveedores;
* productos;
* pagos.

### Empty

Por ejemplo:

* sin proveedores;
* proveedor sin productos asociados;
* proveedor sin pagos.

### Error

Mostrar errores provenientes de la API de manera consistente con el resto del proyecto.

### Success

Confirmar:

* proveedor creado;
* proveedor actualizado;
* proveedor desactivado;
* pago registrado;
* asociación de proveedor modificada en un producto.

---

# 15. Permisos

La UI debe respetar los permisos devueltos por el sistema de autenticación.

Operaciones administrativas:

```text
ADMIN
MANAGER
SUPER_ADMIN
```

Las validaciones definitivas deben realizarse siempre en Backend.

---

# 16. Reportes

Los pagos a proveedores pueden consultarse mediante el reporte existente:

```http
GET /api/v1/reports/supplier-payments/excel
```

El frontend de reportes debe continuar utilizando este endpoint para la exportación correspondiente.

No se debe crear un reporte de facturas de proveedores.

---

# 17. Alcance final

El módulo de proveedores queda compuesto por:

```text
PROVEEDORES
│
├── CRUD de proveedores
│
├── Relación con productos
│     └── Product.supplierId
│
├── Historial de pagos
│
├── Registro de pagos
│
└── Integración con caja
```

Queda fuera:

```text
Supplier Invoices
├── Facturas
├── Vencimientos
├── Deuda por factura
├── Aplicaciones
└── Imputaciones
```

La solución debe mantenerse simple, trazable y preparada para una futura incorporación de un módulo de compras/stock si el negocio lo requiere.
