# Canarias System — Sprint 04

# Fecha Sprint Review

17/07/2026

---

# Duración Sprint

06/07/2026 → 17/07/2026

---

# Objetivo General

Construcción completa del dominio de cobranzas.

El objetivo es dejar operativo:

* registro de pagos
* imputación de cuotas cobradas
* control de visitas fallidas
* cierres diarios de cobradores
* reportes operativos de cobranza

---

# Eventos Sprint

| Fecha | Evento               |
| ----- | -------------------- |
| 06/07 | Daily                |
| 08/07 | Daily                |
| 10/07 | Daily                |
| 13/07 | Daily                |
| 15/07 | Daily                |
| 16/07 | Pre-Demo QA          |
| 17/07 | Sprint Review + Demo |

---

# Entidades Sprint

* payments
* payment_installments
* failed_visits
* daily_closures

---

# Backend Tasks

## Payments Module

* registro de pagos
* validación de importes
* asociación a cliente
* asociación a cobrador
* asociación a sociedad

---

## Payment Installments Module

* imputación automática de cuotas
* imputación manual
* validación de saldo pendiente
* control de cuotas canceladas

---

## Failed Visits Module

* registro de visita fallida
* motivo de visita fallida
* reprogramación de visita
* historial de intentos

---

## Daily Closures Module

* cierre diario cobrador
* consolidación de pagos
* validación administrativa
* auditoría de cierres

---

## Reports Module

* generación hoja de ruta PDF
* reporte de cobranzas diarias Excel
* reporte de cuotas pendientes Excel
* reporte de visitas fallidas PDF
* exportación de datos operativos

---

# API Endpoints

## Payments

### POST /payments

### GET /payments

### GET /payments/:id

---

## Payment Installments

### POST /payment-installments

### GET /payment-installments

---

## Failed Visits

### POST /failed-visits

### GET /failed-visits

### PATCH /failed-visits/:id

---

## Daily Closures

### POST /daily-closures

### GET /daily-closures

### GET /daily-closures/:id

---

# Frontend Tasks

## Payments UI

* registrar pago
* detalle pago
* historial pagos
* búsqueda avanzada

---

## Installments Collection UI

* cuotas pendientes
* cuotas cobradas
* imputación manual
* resumen deuda

---

## Failed Visits UI

* registrar visita fallida
* motivo visita
* historial visitas
* reprogramación

---

## Daily Closures UI

* cierre diario
* resumen cobrador
* validación administración
* historial cierres

---

## Reports UI

* exportar cobranzas Excel
* exportar cuotas pendientes Excel
* exportar visitas fallidas PDF
* descarga hoja de ruta PDF

---

# QA

## Validaciones

* registro pago
* imputación cuotas
* cálculo saldo
* visita fallida
* cierre diario
* conciliación de importes
* generacion PDF
* generacion Excel

---

# Riesgos

| Riesgo              | Mitigación               |
| ------------------- | ------------------------ |
| errores imputación  | validaciones automáticas |
| diferencias de caja | conciliación diaria      |
| cambios operativos  | feedback cobradores      |
| generación reportes | pruebas con datos reales |

---

# Entregables

* pagos operativos
* cuotas imputadas correctamente
* control de visitas fallidas
* cierres diarios funcionales
* reportes operativos PDF y Excel

---

# Sprint Goal

Proceso de cobranza completamente operativo.
