# Canarias System — Sprint 05

# Fecha Sprint Review

07/08/2026

---

# Duración Sprint

20/07/2026 → 31/07/2026

---

# Objetivo General

Construcción del dominio financiero y de abastecimiento básico.

El objetivo es dejar operativo:

* gestión de productos
* disponibilidad básica de productos
* gestión de proveedores
* pagos a proveedores
* gestión de caja
* cuentas financieras básicas
* movimientos financieros
* transferencias internas
* rendiciones y liquidaciones
* emisión de recibos
* reportes financieros básicos

El alcance se limita a la gestión operativa necesaria para el funcionamiento del sistema.

Los procesos administrativos y financieros detallados que actualmente se realizan mediante Excel permanecerán fuera del alcance inicial y continuarán gestionándose manualmente.

---

# Actualización del Sprint

El Sprint 05 fue actualizado a partir de los requerimientos definidos durante las reuniones posteriores a su planificación inicial.

Los principales cambios son:

* se elimina la gestión de categorías de productos;
* se incorpora disponibilidad básica de productos;
* la gestión financiera se mantiene simple y configurable;
* las cuentas financieras deberán permitir representar distintos lugares donde se encuentra el dinero;
* las transferencias representan movimientos reales entre cuentas;
* el saldo que permanece entre períodos no se considera una transferencia;
* las rendiciones y liquidaciones forman parte del flujo financiero;
* se incorpora el concepto de Fondo de Gestión con acceso restringido a MANAGER y SUPER_ADMIN;
* no se incorpora conciliación bancaria;
* se mantiene Excel como herramienta complementaria para procesos administrativos y financieros que no forman parte de esta versión.

---

# Eventos Sprint

| Fecha | Evento               |
| ----- | -------------------- |
| 20/07 | Daily                |
| 22/07 | Daily                |
| 24/07 | Daily                |
| 27/07 | Daily                |
| 29/07 | Daily                |
| 30/07 | Pre-Demo QA          |
| 31/07 | Sprint Review + Demo |

---

# Entidades Sprint

* products
* suppliers
* supplier_payments
* cashbox
* cash_movements
* receipts

Las entidades de cierres diarios y liquidaciones existentes en el sistema participan en el flujo financiero, sin reemplazar su implementación correspondiente.

---

# Backend Tasks

## Products Module

* CRUD productos
* precios
* activación/desactivación
* validaciones comerciales
* disponibilidad básica de productos
* identificación de productos sin disponibilidad

La gestión de categorías queda fuera del alcance.

---

## Suppliers Module

* CRUD proveedores
* información comercial
* historial operaciones
* asociación a sociedades
* activación/desactivación

---

## Supplier Payments Module

* pagos proveedores
* control deuda proveedor
* historial pagos
* validaciones financieras
* relación con movimientos financieros

---

## Cashbox Module

* apertura caja
* cierre caja
* saldo actual
* validaciones operativas
* continuidad del saldo entre períodos
* cuentas financieras básicas
* resumen financiero básico
* control por sociedad
* Fondo de Gestión con acceso restringido

El cierre de caja no implica retirar el dinero disponible.

El saldo de un período podrá continuar como saldo inicial del siguiente período.

---

## Cash Movements Module

* ingresos
* egresos
* transferencias internas
* auditoría movimientos
* relación con pagos
* relación con pagos a proveedores
* trazabilidad de operaciones financieras

Las transferencias deberán representar el movimiento de dinero entre una cuenta origen y una cuenta destino.

---

## Daily Closures / Settlements

* cierre diario de cobradores
* generación de liquidaciones
* validación administrativa
* trazabilidad entre cierre, liquidación y cobranza
* integración con el flujo financiero

La validación de una liquidación deberá permitir posteriormente registrar el impacto financiero correspondiente sin duplicar cobranzas.

---

## Receipts Module

* generación recibos
* numeración automática
* asociación pagos
* emisión PDF

---

## Reports Module

* cierre de caja PDF
* movimientos financieros Excel
* pagos a proveedores Excel
* exportación de recibos PDF
* reportes administrativos disponibles

Los reportes financieros avanzados permanecen fuera del alcance inicial.

---

# API Endpoints

## Products

### POST /products

### GET /products

### GET /products/:id

### PATCH /products/:id

### DELETE /products/:id

---

## Suppliers

### POST /suppliers

### GET /suppliers

### GET /suppliers/:id

### PATCH /suppliers/:id

### DELETE /suppliers/:id

---

## Supplier Payments

### POST /supplier-payments

### GET /supplier-payments

### GET /supplier-payments/supplier/:supplierId

### GET /supplier-payments/:id/applications

### POST /supplier-payments/:id/applications

---

## Cashbox

### POST /cashbox

### GET /cashbox

### GET /cashbox/open

### GET /cashbox/:id

### GET /cashbox/:id/balance

### PATCH /cashbox/:id/close

---

## Cash Movements

### POST /cash-movements

### GET /cash-movements

---

## Receipts

### POST /receipts

### GET /receipts

### GET /receipts/:id

### GET /receipts/:id/pdf

---

## Reports

### GET /reports/cashbox/:id/pdf

### GET /reports/cash-movements/excel

### GET /reports/supplier-payments/excel

### GET /reports/receipts/:id/pdf

### GET /reports/collections/excel

### GET /reports/installments/pending/excel

### GET /reports/failed-visits/pdf

---

# Frontend Tasks

## Products UI

* alta producto
* edición producto
* listado productos
* administración precios
* disponibilidad básica
* identificación de productos sin disponibilidad

---

## Suppliers UI

* alta proveedor
* edición proveedor
* listado proveedores
* detalle proveedor

---

## Supplier Payments UI

* registrar pago
* historial pagos
* deuda proveedor
* resumen financiero

---

## Cashbox UI

* apertura caja
* cierre caja
* consulta caja abierta
* consulta saldo
* movimientos caja
* resumen financiero
* cuentas financieras básicas
* transferencias
* rendiciones/liquidaciones relacionadas
* Fondo de Gestión según permisos

La información restringida del Fondo de Gestión deberá respetar los permisos definidos para MANAGER y SUPER_ADMIN.

---

## Receipts UI

* emisión recibo
* impresión recibo
* historial recibos
* búsqueda recibos

---

## Reports UI

* exportar cierre caja PDF
* exportar movimientos Excel
* exportar pagos proveedores Excel
* exportar recibos PDF
* exportar cobranzas Excel
* exportar cuotas pendientes Excel
* exportar visitas fallidas PDF

---

# QA

## Validaciones

* alta producto
* edición producto
* disponibilidad producto
* alta proveedor
* pago proveedor
* apertura caja
* cierre caja
* consulta saldo
* movimientos financieros
* transferencias
* rendiciones y liquidaciones
* generación recibos
* generación PDF
* generación Excel
* permisos sobre Fondo de Gestión

---

# Riesgos

| Riesgo                                              | Mitigación                                |
| --------------------------------------------------- | ----------------------------------------- |
| diferencias entre saldo calculado y saldo declarado | registro de diferencia y observaciones    |
| errores recibos                                     | validaciones automáticas                  |
| inconsistencias proveedores                         | auditoría de pagos                        |
| cambios catálogo productos                          | parametrización flexible                  |
| movimientos financieros duplicados                  | validaciones y trazabilidad               |
| transferencias incorrectas                          | identificación de cuenta origen y destino |
| acceso no autorizado al Fondo de Gestión            | permisos aplicados en Backend             |

---

# Entregables

* productos administrables
* disponibilidad básica de productos
* gestión proveedores operativa
* pagos proveedores funcionales
* caja operativa
* cuentas financieras básicas
* movimientos financieros
* transferencias internas
* rendiciones y liquidaciones integradas al flujo financiero
* Fondo de Gestión con acceso restringido
* recibos automáticos
* reportes financieros básicos

---

# Alcance Manual / Excel

La primera versión no reemplazará todos los controles administrativos que actualmente realiza la empresa mediante Excel.

Podrán continuar gestionándose manualmente:

* controles financieros detallados;
* análisis administrativos avanzados;
* información contable;
* procesos de salarios;
* comisiones;
* anticipos;
* rendimientos financieros;
* inversiones;
* análisis de rentabilidad;
* controles avanzados de stock;
* procesos administrativos que no formen parte de los módulos implementados.

Estos procesos quedan documentados como parte de la evolución futura del sistema.

---

# Evolución Futura

Se mantiene una arquitectura preparada para incorporar posteriormente:

* compras completas;
* stock avanzado;
* clasificación avanzada de gastos;
* análisis financiero avanzado;
* rentabilidad;
* salarios;
* comisiones;
* anticipos;
* rendimientos financieros;
* inversiones;
* automatización de controles actualmente realizados mediante Excel;
* reportes financieros avanzados;
* nuevas cuentas y medios financieros.

La conciliación bancaria no forma parte del alcance definido para el proyecto.

---

# Sprint Goal

Administración operativa de productos, proveedores y finanzas básicas integrada al sistema, manteniendo Excel como soporte para los procesos administrativos y financieros que quedan fuera del alcance inicial.

El sistema deberá quedar preparado para evolucionar hacia una gestión financiera y administrativa más completa sin requerir una reconstrucción del dominio actual.
