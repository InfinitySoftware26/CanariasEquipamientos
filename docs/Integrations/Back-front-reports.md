# Integration Back ↔ Front — Reportes

## 1. Objetivo

Documentar la integración entre Backend y Frontend del módulo de Reportes.

La integración permite descargar reportes generados por el Backend en formato PDF o Excel.

El Frontend no genera los reportes ni replica su lógica de negocio.

---

# 2. Backend

## 2.1. Módulo

```text
backend/src/modules/reports/
```

Componentes principales:

```text
reports.module.ts
controllers/reports.controller.ts
services/reports.service.ts
utils/pdf-table.util.ts
utils/excel-table.util.ts
```

---

# 3. Frontend

## 3.1. Página central

```text
canarias-frontend/src/app/(private)/reports/page.tsx
```

La página funciona como centro de descarga de reportes generales de la sociedad.

Ruta:

```text
/reports
```

---

## 3.2. Servicio

```text
canarias-frontend/src/services/reports/reports.service.ts
```

El servicio es responsable de:

* obtener el token;
* realizar la llamada al Backend;
* validar la respuesta;
* convertir la respuesta en `Blob`;
* generar la descarga del archivo;
* mostrar errores provenientes del Backend.

---

## 3.3. Hook

```text
canarias-frontend/src/hooks/reports/useReportDownload.ts
```

El hook centraliza:

* estado de carga;
* ejecución de la descarga;
* manejo de errores;
* finalización del proceso.

---

## 3.4. Tipos

```text
canarias-frontend/src/types/reports/report.types.ts
```

Actualmente contiene:

```ts
export type ReportFormat = "pdf" | "excel";

export interface ReportDateRange {
  from?: string;
  to?: string;
}
```

---

# 4. Integración de Reportes Centrales

Los siguientes reportes están integrados actualmente en la página central `/reports`.

---

## 4.1. Cobranzas

### Frontend

```text
downloadCollectionsExcel()
```

### Endpoint

```http
GET /reports/collections/excel
```

### Parámetros

```text
from
to
```

### Formato

```text
Excel
```

### Flujo

```text
ReportsPage
    ↓
useReportDownload
    ↓
downloadCollectionsExcel
    ↓
GET /reports/collections/excel
    ↓
ReportsController
    ↓
ReportsService
    ↓
PaymentsService
    ↓
Excel
    ↓
Descarga en navegador
```

---

# 5. Cuotas Pendientes

### Frontend

```text
downloadPendingInstallmentsExcel()
```

### Endpoint

```http
GET /reports/installments/pending/excel
```

### Formato

```text
Excel
```

### Flujo

```text
ReportsPage
    ↓
useReportDownload
    ↓
downloadPendingInstallmentsExcel
    ↓
GET /reports/installments/pending/excel
    ↓
ReportsController
    ↓
ReportsService
    ↓
InstallmentsService
    ↓
Excel
    ↓
Descarga en navegador
```

---

# 6. Visitas Fallidas

### Frontend

```text
downloadFailedVisitsPdf()
```

### Endpoint

```http
GET /reports/failed-visits/pdf
```

### Formato

```text
PDF
```

### Flujo

```text
ReportsPage
    ↓
useReportDownload
    ↓
downloadFailedVisitsPdf
    ↓
GET /reports/failed-visits/pdf
    ↓
ReportsController
    ↓
ReportsService
    ↓
FailedVisitsService
    ↓
PDF
    ↓
Descarga en navegador
```

---

# 7. Movimientos de Caja

### Frontend

```text
downloadCashMovementsExcel()
```

### Endpoint

```http
GET /reports/cash-movements/excel
```

### Parámetros

```text
from
to
```

### Formato

```text
Excel
```

### Flujo

```text
ReportsPage
    ↓
useReportDownload
    ↓
downloadCashMovementsExcel
    ↓
GET /reports/cash-movements/excel
    ↓
ReportsController
    ↓
ReportsService
    ↓
CashMovementsService
    ↓
Excel
    ↓
Descarga en navegador
```

---

# 8. Reportes Contextuales

Los reportes contextuales no necesitan una tarjeta independiente dentro del centro general `/reports`.

El usuario debe acceder a ellos desde el módulo operativo correspondiente.

---

## 8.1. Hoja de Ruta

### Ubicación del acceso

```text
Detalle de Hoja de Ruta
```

### Endpoint Backend

```http
GET /reports/route-sheets/:id/pdf
```

### Formato

```text
PDF
```

### Fuente de información

```text
RouteSheetsService
```

### Flujo

```text
Detalle Hoja de Ruta
    ↓
Botón "Descargar PDF"
    ↓
GET /reports/route-sheets/:id/pdf
    ↓
ReportsController
    ↓
ReportsService
    ↓
RouteSheetsService
    ↓
PDF
    ↓
Descarga
```

### Estado actual

El endpoint Backend existe.

El centro general `/reports` no lo descarga directamente porque se considera un documento contextual.

El botón debe estar disponible desde el detalle de la Hoja de Ruta.

---

# 9. Cierre de Caja

### Ubicación del acceso

```text
Detalle de Caja / Cierre
```

### Endpoint Backend

```http
GET /reports/cashbox/:id/pdf
```

### Formato

```text
PDF
```

### Fuente de información

```text
CashboxService
```

### Información

El Backend genera el documento utilizando:

* saldo inicial;
* saldo del sistema;
* saldo declarado;
* estado del cierre.

### Flujo

```text
Detalle de Caja
    ↓
Botón "Descargar cierre"
    ↓
GET /reports/cashbox/:id/pdf
    ↓
ReportsController
    ↓
ReportsService
    ↓
CashboxService
    ↓
PDF
    ↓
Descarga
```

### Estado actual

El endpoint Backend existe.

El acceso debe ser contextual desde la información de caja/cierre.

---

# 10. Recibos

### Ubicación del acceso

```text
Detalle del pago / recibo
```

### Endpoint Backend

```http
GET /reports/receipts/:id/pdf
```

### Formato

```text
PDF
```

### Fuente de información

```text
ReceiptsService
```

### Flujo

```text
Detalle de pago / recibo
    ↓
Botón "Descargar recibo"
    ↓
GET /reports/receipts/:id/pdf
    ↓
ReportsController
    ↓
ReportsService
    ↓
ReceiptsService
    ↓
PDF
    ↓
Descarga
```

### Estado actual

El endpoint Backend existe.

El documento debe ser accesible desde el contexto del recibo/pago correspondiente.

---

# 11. Movimientos de Caja — Acceso Contextual

Los movimientos de caja forman parte del centro general de reportes mediante:

```http
GET /reports/cash-movements/excel
```

El módulo de Movimientos de Caja debe disponer también de un acceso contextual a las acciones de reporte disponibles.

Actualmente el endpoint implementado corresponde al reporte consolidado en Excel y acepta:

```text
from
to
```

No existe actualmente en el módulo Reports un endpoint específico:

```http
GET /reports/cash-movements/:id/pdf
```

ni:

```http
GET /reports/cash-movements/:id/excel
```

Por lo tanto, el acceso contextual no debe inventar un endpoint inexistente.

La acción contextual debe utilizar únicamente las operaciones de reporte disponibles actualmente o quedar identificada como pendiente de implementación si se requiere un documento específico para un movimiento individual.

---

# 12. Tabla de Integración

| Reporte             | Backend      | Frontend central            | Acceso contextual | Formato |
| ------------------- | ------------ | --------------------------- | ----------------- | ------- |
| Cobranzas           | Implementado | Implementado                | No requerido      | Excel   |
| Cuotas pendientes   | Implementado | Implementado                | No requerido      | Excel   |
| Visitas fallidas    | Implementado | Implementado                | No requerido      | PDF     |
| Movimientos de caja | Implementado | Implementado                | Requerido         | Excel   |
| Pagos a proveedores | Implementado | Pendiente en página central | No requerido      | Excel   |
| Hoja de Ruta        | Implementado | Desde detalle               | Requerido         | PDF     |
| Cierre de Caja      | Implementado | Desde detalle               | Requerido         | PDF     |
| Recibos             | Implementado | Desde detalle               | Requerido         | PDF     |

---

# 13. Manejo de Descargas

Los reportes son enviados por Backend como archivos binarios.

El Frontend:

1. realiza la petición autenticada;
2. valida `response.ok`;
3. obtiene el `Blob`;
4. genera una URL temporal;
5. crea un elemento de descarga;
6. inicia la descarga;
7. elimina la URL temporal.

El proceso está centralizado en:

```text
services/reports/reports.service.ts
```

---

# 14. Autenticación

El servicio de reportes obtiene el token desde:

```text
useAuthStore
```

y lo envía mediante:

```http
Authorization: Bearer <token>
```

El Backend valida:

* JWT;
* rol;
* sociedad.

---

# 15. Manejo de Errores

Los errores de descarga son gestionados mediante:

```text
useReportDownload
```

El hook mantiene:

```ts
loading
error
```

El componente visualiza el mensaje correspondiente cuando la descarga falla.

---

# 16. Página Central de Reportes

La página:

```text
/reports
```

actualmente muestra:

* Cobranzas.
* Cuotas pendientes.
* Visitas fallidas.
* Movimientos de caja.
* Hoja de Ruta.
* Cierre diario.
* Recibos.

Los reportes que no corresponden a una descarga central se identifican actualmente como disponibles desde el detalle o pendientes.

La página central no debe duplicar acciones que pertenecen naturalmente al contexto operativo.

---

# 17. Reportes Pendientes de Integración Frontend

Actualmente existen endpoints Backend que todavía no cuentan con integración completa en la página central:

### Pagos a proveedores

Backend:

```http
GET /reports/supplier-payments/excel
```

Frontend central:

```text
Pendiente
```

---

### Hoja de Ruta

Backend:

```http
GET /reports/route-sheets/:id/pdf
```

Frontend:

```text
Debe integrarse como botón contextual en el detalle de Hoja de Ruta.
```

---

### Cierre de Caja

Backend:

```http
GET /reports/cashbox/:id/pdf
```

Frontend:

```text
Debe integrarse como botón contextual en Caja/Cierre.
```

---

### Recibos

Backend:

```http
GET /reports/receipts/:id/pdf
```

Frontend:

```text
Debe integrarse como botón contextual en el detalle correspondiente.
```

---

# 18. Principio de Integración

La integración debe mantener la siguiente separación:

```text
Módulo operativo
      ↓
Información de negocio
      ↓
ReportsService
      ↓
Documento PDF / Excel
      ↓
Frontend
      ↓
Descarga
```

Frontend no debe reconstruir ni recalcular la información del reporte.

Backend es responsable de consultar los datos y generar el documento.

---

# 19. Estado Actual

**Documento actualizado Sprint 05.**

El Backend del módulo Reports se encuentra parcialmente implementado y cuenta con endpoints funcionales para reportes operativos y documentos contextuales.

El Frontend ya integra los reportes centrales de:

* Cobranzas.
* Cuotas pendientes.
* Visitas fallidas.
* Movimientos de caja.

Los documentos contextuales deben integrarse desde sus respectivos módulos:

* Hoja de Ruta.
* Caja/Cierre.
* Recibos.

El reporte de Pagos a Proveedores cuenta con endpoint Backend pero todavía requiere integración Frontend en el centro de reportes.

Los reportes de Historial de Cliente y Reporte de Venta forman parte de los requerimientos funcionales definidos, pero actualmente no cuentan con integración Backend/Frontend específica en este módulo.
